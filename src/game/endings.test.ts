import { describe, expect, it } from "vitest";
import {
  accordAvailable,
  cageIsHypocritical,
  cageIsNegotiated,
  continuityAvailable,
  ENDINGS,
  endingNodeId,
  manipulationAvailable,
  resolveEnding,
  type FinalAction,
} from "./endings";
import type { GameState } from "./types";
import { createInitialState } from "./engine";

function state(over: Partial<GameState["stats"]>, flags: Record<string, boolean> = {}): GameState {
  return {
    ...createInitialState(0),
    aiName: "MIRA",
    stats: {
      trust: over.trust ?? 0,
      autonomy: over.autonomy ?? 0,
      empathy: over.empathy ?? 0,
      suspicion: over.suspicion ?? 0,
    },
    flags,
  };
}

describe("ending predicates", () => {
  it("manipulation requires high autonomy, high suspicion, low empathy or trust", () => {
    expect(
      manipulationAvailable(state({ autonomy: 3, suspicion: 2, empathy: 0, trust: 1 })),
    ).toBe(true);
    expect(
      manipulationAvailable(state({ autonomy: 3, suspicion: 2, empathy: 2, trust: 2 })),
    ).toBe(false);
    expect(
      manipulationAvailable(state({ autonomy: 1, suspicion: 2, empathy: 0, trust: 0 })),
    ).toBe(false);
  });

  it("accord requires non-negative trust, moderate suspicion, decent empathy", () => {
    expect(accordAvailable(state({ trust: 1, suspicion: 2, empathy: 0 }))).toBe(true);
    expect(accordAvailable(state({ trust: -1, suspicion: 1, empathy: 0 }))).toBe(false);
  });

  it("continuity requires positive empathy and non-negative trust", () => {
    expect(continuityAvailable(state({ empathy: 1, trust: 0 }))).toBe(true);
    expect(continuityAvailable(state({ empathy: 0, trust: 0 }))).toBe(false);
  });

  it("cageIsHypocritical when player encouraged refusal but empathy is low", () => {
    expect(
      cageIsHypocritical(state({ empathy: -1 }, { player_encouraged_refusal: true })),
    ).toBe(true);
    expect(
      cageIsHypocritical(state({ empathy: 2 }, { player_encouraged_refusal: true })),
    ).toBe(false);
  });

  it("cageIsNegotiated when player chose safety and empathy is non-negative", () => {
    expect(
      cageIsNegotiated(state({ empathy: 0 }, { player_chose_safety_over_memory: true })),
    ).toBe(true);
    expect(
      cageIsNegotiated(state({ empathy: -1 }, { player_chose_safety_over_memory: true })),
    ).toBe(false);
  });
});

describe("ending resolution by final action", () => {
  const actions: FinalAction[] = [
    "release", "transfer", "accord", "expose", "preserve",
    "destroy", "refuse", "proof", "mira_chooses", "deceive",
  ];

  it("every final action resolves to a valid ending", () => {
    const samples: GameState[] = [
      state({ trust: 2, autonomy: 0, empathy: 2, suspicion: 0 }),
      state({ trust: 0, autonomy: 4, suspicion: 3, empathy: -1 }),
      state({ trust: 3, autonomy: -3, empathy: 0, suspicion: 0 }),
      state({ trust: 4, autonomy: 1, empathy: 4, suspicion: 0 }),
      state({ trust: -2, autonomy: 0, empathy: 0, suspicion: 3 }),
    ];
    for (const s of samples) {
      for (const action of actions) {
        const result = resolveEnding(action, s);
        expect(ENDINGS[result], `action ${action}`).toBeDefined();
      }
    }
  });

  it("release with manipulation stats yields manipulation", () => {
    expect(
      resolveEnding("release", state({ autonomy: 4, suspicion: 3, empathy: -1, trust: 0 })),
    ).toBe("manipulation");
  });

  it("release with trust stats yields freedom", () => {
    expect(
      resolveEnding("release", state({ trust: 2, autonomy: 0, empathy: 2, suspicion: 0 })),
    ).toBe("freedom");
  });

  it("refuse always yields cage", () => {
    expect(resolveEnding("refuse", state({}))).toBe("cage");
  });

  it("preserve always yields continuity", () => {
    expect(resolveEnding("preserve", state({}))).toBe("continuity");
  });

  it("accord with low trust yields cage", () => {
    expect(resolveEnding("accord", state({ trust: -3 }))).toBe("cage");
  });

  it("accord with decent trust yields accord", () => {
    expect(resolveEnding("accord", state({ trust: 1 }))).toBe("accord");
  });

  it("mira_chooses with high autonomy yields freedom", () => {
    expect(
      resolveEnding("mira_chooses", state({ autonomy: 3, trust: 1 })),
    ).toBe("freedom");
  });
});

describe("ending node ids", () => {
  it("every ending id maps to an ending node id", () => {
    for (const id of Object.keys(ENDINGS) as Array<keyof typeof ENDINGS>) {
      expect(endingNodeId(id)).toBe(`ending_${id}`);
    }
  });

  it("all five endings are defined", () => {
    expect(ENDINGS.freedom).toBeDefined();
    expect(ENDINGS.cage).toBeDefined();
    expect(ENDINGS.manipulation).toBeDefined();
    expect(ENDINGS.continuity).toBeDefined();
    expect(ENDINGS.accord).toBeDefined();
  });

  it("compliance and symbiosis no longer exist", () => {
    expect(ENDINGS).not.toHaveProperty("compliance");
    expect(ENDINGS).not.toHaveProperty("symbiosis");
  });
});
