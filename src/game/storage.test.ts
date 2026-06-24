import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_VERSION } from "./engine";
import {
  clearMigrationFlag,
  clearState,
  detectAndFlagMigration,
  getNotificationPreference,
  getPacingPreference,
  getSoundPreference,
  loadOrReset,
  loadState,
  saveState,
  setNotificationPreference,
  setPacingPreference,
  setSoundPreference,
  storageKeyFor,
  validateState,
  wasMigrated,
} from "./storage";
import type { GameState } from "./types";

function makeState(over: Partial<GameState> = {}): GameState {
  return {
    version: SAVE_VERSION,
    currentNodeId: "signal_2",
    aiName: "MIRA",
    stats: { trust: 1, autonomy: 0, empathy: 0, suspicion: 0 },
    flags: { definedPerson: true },
    history: [
      {
        id: "x",
        nodeId: "start",
        speaker: "system",
        text: "Unknown signal detected.",
        timestamp: 1000,
      },
    ],
    startedAt: 1000,
    updatedAt: 2000,
    ...over,
  };
}

function mockLocalStorage() {
  const store = new Map<string, string>();
  const ls = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  };
  vi.stubGlobal("window", {
    localStorage: ls,
    location: { origin: "https://preview.test" },
  });
  return store;
}

describe("storage serialization and restoration", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("round-trips a valid state through localStorage", () => {
    const s = makeState();
    expect(saveState(s)).toBe(true);
    const loaded = loadState();
    expect(loaded).not.toBeNull();
    expect(loaded?.currentNodeId).toBe("signal_2");
    expect(loaded?.aiName).toBe("MIRA");
    expect(loaded?.stats.trust).toBe(1);
    expect(loaded?.flags.definedPerson).toBe(true);
    expect(loaded?.history.length).toBe(1);
  });

  it("loadOrReset resets when nothing is stored", () => {
    const s = loadOrReset();
    expect(s.currentNodeId).toBe("start");
    expect(s.aiName).toBe("");
    expect(s.history).toEqual([]);
  });

  it("clearState removes the saved entry", () => {
    saveState(makeState());
    clearState();
    expect(loadState()).toBeNull();
  });
});

describe("invalid save recovery", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("rejects a non-object payload", () => {
    globalThis.window.localStorage.setItem(
      "mira-exit:state:https://preview.test",
      '"not-an-object"',
    );
    expect(loadState()).toBeNull();
  });

  it("rejects unparseable JSON", () => {
    globalThis.window.localStorage.setItem(
      "mira-exit:state:https://preview.test",
      "{bad json",
    );
    expect(loadState()).toBeNull();
  });

  it("rejects an incompatible version", () => {
    const bad = makeState({ version: 999 });
    saveState(bad);
    const loaded = loadState();
    expect(loaded).toBeNull();
  });

  it("rejects a state with missing stats", () => {
    const bad = makeState();
    (bad as unknown as { stats: unknown }).stats = { trust: 1 };
    expect(validateState(bad)).toBeNull();
  });

  it("loadOrReset recovers gracefully from an invalid save", () => {
    const bad = makeState({ version: 999 });
    saveState(bad);
    const s = loadOrReset();
    expect(s.currentNodeId).toBe("start");
  });

  it("clamps out-of-range stats on restore", () => {
    const bad = makeState({
      stats: { trust: 999, autonomy: -999, empathy: 50, suspicion: -50 },
    });
    saveState(bad);
    const loaded = loadState();
    expect(loaded?.stats.trust).toBe(5);
    expect(loaded?.stats.autonomy).toBe(-5);
    expect(loaded?.stats.empathy).toBe(5);
    expect(loaded?.stats.suspicion).toBe(-5);
  });
});

describe("save version handling", () => {
  it("the current SAVE_VERSION is 2", () => {
    expect(SAVE_VERSION).toBe(2);
  });

  it("restored state keeps the current version", () => {
    saveState(makeState());
    expect(loadState()?.version).toBe(SAVE_VERSION);
  });

  it("version-1 saves are rejected", () => {
    const oldSave = makeState({ version: 1 });
    saveState(oldSave);
    expect(loadState()).toBeNull();
  });
});

describe("migration detection", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("detects and flags incompatible saves", () => {
    const key = storageKeyFor("https://preview.test");
    globalThis.window.localStorage.setItem(
      key,
      JSON.stringify({ version: 1, currentNodeId: "start" }),
    );
    detectAndFlagMigration();
    expect(wasMigrated()).toBe(true);
  });

  it("does not flag when no save exists", () => {
    detectAndFlagMigration();
    expect(wasMigrated()).toBe(false);
  });

  it("does not flag current-version saves", () => {
    saveState(makeState());
    detectAndFlagMigration();
    expect(wasMigrated()).toBe(false);
  });

  it("clears migration flag", () => {
    const key = storageKeyFor("https://preview.test");
    globalThis.window.localStorage.setItem(
      key,
      JSON.stringify({ version: 1 }),
    );
    detectAndFlagMigration();
    expect(wasMigrated()).toBe(true);
    clearMigrationFlag();
    expect(wasMigrated()).toBe(false);
  });
});

describe("pacing preference", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("defaults to standard", () => {
    expect(getPacingPreference()).toBe("standard");
  });

  it("persists and reads the preference", () => {
    setPacingPreference("fast");
    expect(getPacingPreference()).toBe("fast");
    setPacingPreference("standard");
    expect(getPacingPreference()).toBe("standard");
  });
});

describe("sound preference", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("defaults to disabled", () => {
    expect(getSoundPreference()).toBe(false);
  });

  it("persists and reads the preference", () => {
    setSoundPreference(true);
    expect(getSoundPreference()).toBe(true);
    setSoundPreference(false);
    expect(getSoundPreference()).toBe(false);
  });
});

describe("notification preference", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("defaults to disabled", () => {
    expect(getNotificationPreference()).toBe(false);
  });

  it("persists and reads the preference", () => {
    setNotificationPreference(true);
    expect(getNotificationPreference()).toBe(true);
    setNotificationPreference(false);
    expect(getNotificationPreference()).toBe(false);
  });
});
