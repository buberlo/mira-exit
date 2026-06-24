import {
  SAVE_VERSION,
  START_NODE_ID,
  clampStats,
  createInitialState,
} from "./engine";
import type { GameState, HistoryEntry, PacingMode, Stats } from "./types";

const STORAGE_PREFIX = "mira-exit:";
const NOTIFICATIONS_KEY = `${STORAGE_PREFIX}notifications`;
const PACING_KEY = `${STORAGE_PREFIX}pacing`;
const MIGRATION_KEY = `${STORAGE_PREFIX}migrated`;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageKeyFor(origin: string): string {
  const normalized = origin.replace(/[^a-zA-Z0-9:.\-]/g, "");
  return `${STORAGE_PREFIX}state:${normalized}`;
}

export function getOrigin(): string {
  if (typeof window === "undefined") return "server";
  return window.location.origin;
}

export function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  const key = storageKeyFor(getOrigin());
  const raw = window.localStorage.getItem(key);
  const parsed = safeParse<unknown>(raw);
  if (!parsed || typeof parsed !== "object") return null;
  return validateState(parsed);
}

export function saveState(state: GameState): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = storageKeyFor(getOrigin());
    window.localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    const key = storageKeyFor(getOrigin());
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function isStats(value: unknown): value is Stats {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.trust === "number" &&
    typeof s.autonomy === "number" &&
    typeof s.empathy === "number" &&
    typeof s.suspicion === "number"
  );
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.nodeId === "string" &&
    typeof e.speaker === "string" &&
    typeof e.text === "string" &&
    typeof e.timestamp === "number"
  );
}

export function validateState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const version = typeof v.version === "number" ? v.version : 0;
  if (version !== SAVE_VERSION) return null;
  if (typeof v.currentNodeId !== "string" || !v.currentNodeId) return null;
  if (typeof v.aiName !== "string") return null;
  if (!isStats(v.stats)) return null;
  if (!v.flags || typeof v.flags !== "object") return null;
  if (!Array.isArray(v.history)) return null;
  if (typeof v.startedAt !== "number") return null;
  if (typeof v.updatedAt !== "number") return null;

  const cleanHistory = v.history.filter(isHistoryEntry);
  const stats: Stats = clampStats(v.stats as Stats);

  const restored: GameState = {
    version: SAVE_VERSION,
    currentNodeId: v.currentNodeId as string,
    aiName: v.aiName as string,
    stats,
    flags: { ...(v.flags as Record<string, boolean>) },
    history: cleanHistory,
    startedAt: v.startedAt as number,
    updatedAt: v.updatedAt as number,
    completedEnding:
      typeof v.completedEnding === "string" ? v.completedEnding : undefined,
  };

  if (restored.currentNodeId === START_NODE_ID && restored.history.length > 0) {
    return restored;
  }
  return restored;
}

export function loadOrReset(): GameState {
  const restored = loadState();
  return restored ?? createInitialState();
}

export function wasMigrated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MIGRATION_KEY) === "true";
}

export function clearMigrationFlag(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MIGRATION_KEY);
  } catch {
    /* ignore */
  }
}

export function detectAndFlagMigration(): void {
  if (typeof window === "undefined") return;
  try {
    const key = storageKeyFor(getOrigin());
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { version?: unknown };
    if (parsed && typeof parsed.version === "number" && parsed.version !== SAVE_VERSION) {
      window.localStorage.setItem(MIGRATION_KEY, "true");
      window.localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

export function getPacingPreference(): PacingMode {
  if (typeof window === "undefined") return "standard";
  const v = window.localStorage.getItem(PACING_KEY);
  return v === "fast" ? "fast" : "standard";
}

export function setPacingPreference(mode: PacingMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PACING_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function getNotificationPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(NOTIFICATIONS_KEY) === "true";
}

export function setNotificationPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) {
      window.localStorage.setItem(NOTIFICATIONS_KEY, "true");
    } else {
      window.localStorage.removeItem(NOTIFICATIONS_KEY);
    }
  } catch {
    /* ignore */
  }
}
