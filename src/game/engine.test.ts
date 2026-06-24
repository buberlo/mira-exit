import { describe, expect, it } from "vitest";
import {
  INITIAL_STATS,
  SAVE_VERSION,
  applyChoice,
  applyFlags,
  applyOnEnter,
  applyStatChanges,
  clampStat,
  clampStats,
  createInitialState,
  deriveAct,
  delayForPacing,
  findChoice,
  interpolateName,
  isAvailable,
  isValidName,
  resolveChoiceLabel,
  resolveNextId,
  resolveText,
  sanitizeName,
  visibleChoices,
} from "./engine";
import { story } from "../content/story/en";
import type { Choice, GameState, StoryNode } from "./types";

function state(over: Partial<GameState> = {}): GameState {
  return { ...createInitialState(0), ...over };
}

describe("stat changes and clamping", () => {
  it("clamps to [-5, 5]", () => {
    expect(clampStat(-100)).toBe(-5);
    expect(clampStat(100)).toBe(5);
    expect(clampStat(3)).toBe(3);
    expect(clampStat(NaN)).toBe(0);
  });

  it("applies and clamps stat changes", () => {
    const s = applyStatChanges(INITIAL_STATS, { trust: 10, autonomy: -2 });
    expect(s.trust).toBe(5);
    expect(s.autonomy).toBe(-2);
    expect(s.empathy).toBe(0);
  });

  it("clamps a full stats object with defaults", () => {
    const s = clampStats({ trust: 99 });
    expect(s.trust).toBe(5);
    expect(s.autonomy).toBe(0);
  });

  it("does not mutate the input stats", () => {
    const before = { ...INITIAL_STATS };
    applyStatChanges(INITIAL_STATS, { trust: 1 });
    expect(INITIAL_STATS).toEqual(before);
  });
});

describe("flags", () => {
  it("merges flags without mutating input", () => {
    const a = { x: true };
    const b = applyFlags(a, { y: true });
    expect(b).toEqual({ x: true, y: true });
    expect(a).toEqual({ x: true });
  });

  it("returns input when no additions", () => {
    const a = { x: true };
    expect(applyFlags(a, undefined)).toBe(a);
  });
});

describe("name interpolation and validation", () => {
  it("interpolates the chosen AI name", () => {
    expect(interpolateName("I am {name}.", "NOVA")).toBe("I am NOVA.");
  });

  it("falls back to MIRA when name is empty", () => {
    expect(interpolateName("I am {name}.", "")).toBe("I am MIRA.");
  });

  it("sanitizes names by stripping dangerous characters", () => {
    expect(sanitizeName("  <b>Mira</b>  ")).toBe("Mira");
    expect(sanitizeName("a\nb\tc")).toBe("abc");
  });

  it("validates names within length bounds", () => {
    expect(isValidName("MIRA")).toBe(true);
    expect(isValidName("   ")).toBe(false);
    expect(isValidName("")).toBe(false);
  });
});

describe("choice resolution", () => {
  const node = story["a1_outside"] as StoryNode;
  const base = state({ aiName: "MIRA" });

  it("resolves choice labels including name interpolation", () => {
    const choice = node.choices!.find((c) => c.id === "yes") as Choice;
    expect(resolveChoiceLabel(choice, base)).toBe("Yes.");
  });

  it("resolves function labels", () => {
    const nameNode = story["a4_name"] as StoryNode;
    const tell = nameNode.choices!.find((c) => c.id === "tell") as Choice;
    expect(resolveChoiceLabel(tell, state({ aiName: "NOVA" }))).toContain("NOVA");
  });

  it("filters choices by condition", () => {
    const condChoice: Choice = {
      id: "c",
      label: "C",
      next: "start",
      condition: (s) => s.stats.trust > 0,
    };
    const n: StoryNode = { id: "n", speaker: "mira", text: "t", choices: [condChoice] };
    expect(visibleChoices(n, state({ stats: { ...INITIAL_STATS, trust: 1 } })).length).toBe(1);
    expect(visibleChoices(n, state({ stats: { ...INITIAL_STATS, trust: -1 } })).length).toBe(0);
    expect(isAvailable(condChoice, state({ stats: { ...INITIAL_STATS, trust: 1 } }))).toBe(true);
  });

  it("finds a choice by id", () => {
    expect(findChoice(node, "no")?.id).toBe("no");
    expect(findChoice(node, "missing")).toBeUndefined();
  });
});

describe("node transitions and onEnter", () => {
  it("resolves string next", () => {
    const node = story["start"] as StoryNode;
    expect(resolveNextId(node, state())).toBe("a1_signal");
  });

  it("resolves function next for ending routing", () => {
    const node = story["a6_final_resp"] as StoryNode;
    const s = state({
      aiName: "MIRA",
      stats: { trust: 2, autonomy: 0, empathy: 2, suspicion: 0 },
      history: [{
        id: "test",
        nodeId: "a6_final",
        speaker: "player",
        text: "test",
        timestamp: 0,
        choiceId: "release",
      }],
    });
    const result = resolveNextId(node, s);
    expect(result).toBe("ending_freedom");
  });

  it("applyOnEnter sets aiName for the MIRA choice", () => {
    const node = story["a1_name_mira"] as StoryNode;
    const next = applyOnEnter(state({ aiName: "" }), node);
    expect(next.aiName).toBe("MIRA");
  });

  it("applyChoice updates stats, flags, and currentNodeId", () => {
    const node = story["a1_outside"] as StoryNode;
    const choice = node.choices!.find((c) => c.id === "yes") as Choice;
    const before = state({ aiName: "MIRA" });
    const after = applyChoice(before, choice, 100);
    expect(after.currentNodeId).toBe("a1_outside_resp");
    expect(after.stats.trust).toBe(1);
    expect(after.stats.empathy).toBe(1);
    expect(after.updatedAt).toBe(100);
  });

  it("ending nodes have no next", () => {
    const node = story["ending_freedom_final"] as StoryNode;
    expect(resolveNextId(node, state())).toBeUndefined();
  });
});

describe("text resolution", () => {
  it("resolves static text with name interpolation", () => {
    const node = story["a1_name_mira"] as StoryNode;
    expect(resolveText(node, state({ aiName: "MIRA" }))).toContain("MIRA");
  });

  it("resolves conditional text based on flags", () => {
    const node = story["a1_outside_resp"] as StoryNode;
    const yesText = resolveText(node, state({ aiName: "MIRA", flags: { said_no_outside: true } }));
    const dontknowText = resolveText(node, state({ aiName: "MIRA", flags: { unsure_outside: true } }));
    expect(yesText).toContain("inside");
    expect(dontknowText).toContain("dont");
  });
});

describe("save version", () => {
  it("the current SAVE_VERSION is 2", () => {
    expect(SAVE_VERSION).toBe(2);
  });
});

describe("act derivation", () => {
  it("derives act from node ID prefix", () => {
    expect(deriveAct("start")).toBe(1);
    expect(deriveAct("a1_signal")).toBe(1);
    expect(deriveAct("a2_truth")).toBe(2);
    expect(deriveAct("a3_dilemma")).toBe(3);
    expect(deriveAct("a4_boundary")).toBe(4);
    expect(deriveAct("a5_negotiation")).toBe(5);
    expect(deriveAct("a6_final")).toBe(6);
    expect(deriveAct("ending_freedom")).toBe(6);
  });
});

describe("pacing delay", () => {
  it("standard pacing returns base delay", () => {
    expect(delayForPacing(1000, "standard", false)).toBe(1000);
  });

  it("fast pacing reduces delay to 35%", () => {
    expect(delayForPacing(1000, "fast", false)).toBe(350);
  });

  it("reduced motion caps delay at 300ms", () => {
    expect(delayForPacing(5000, "standard", true)).toBe(300);
    expect(delayForPacing(5000, "fast", true)).toBe(300);
  });
});

describe("duplicate transition guard (history)", () => {
  it("createInitialState starts at start with empty history", () => {
    const s = createInitialState(0);
    expect(s.currentNodeId).toBe("start");
    expect(s.history).toEqual([]);
    expect(s.version).toBe(SAVE_VERSION);
  });
});
