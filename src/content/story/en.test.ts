import { describe, expect, it } from "vitest";
import { story } from "./en";
import {
  ENDINGS,
  resolveEnding,
  type FinalAction,
} from "../../game/endings";
import { createInitialState } from "../../game/engine";
import type { EndingId, GameState, StoryNode } from "../../game/types";

const nodeIds = Object.keys(story);

function isEndingId(value: string): value is EndingId {
  return value in ENDINGS;
}

function outgoingEdges(node: StoryNode): string[] {
  const edges: string[] = [];
  if (node.ending) return edges;
  if (node.input) {
    edges.push(node.input.next);
    return edges;
  }
  if (node.choices) {
    for (const c of node.choices) {
      if (typeof c.next === "string") edges.push(c.next);
    }
  }
  if (typeof node.next === "string") edges.push(node.next);
  else if (typeof node.next === "function") {
    for (const id of nodeIds) {
      if (id.startsWith("ending_")) edges.push(id);
    }
  }
  return edges;
}

function computeReachable(): Set<string> {
  const reachable = new Set<string>();
  const queue = ["start"];
  reachable.add("start");
  while (queue.length > 0) {
    const id = queue.shift() as string;
    for (const target of outgoingEdges(story[id])) {
      if (!reachable.has(target)) {
        reachable.add(target);
        queue.push(target);
      }
    }
  }
  return reachable;
}

describe("story structure — minimums", () => {
  it("has at least 85 nodes", () => {
    expect(nodeIds.length).toBeGreaterThanOrEqual(85);
  });

  it("has a start node", () => {
    expect(story.start).toBeDefined();
    expect(story.start.speaker).toBe("system");
  });

  it("has at least 28 meaningful choices across nodes", () => {
    const choiceNodes = nodeIds.filter(
      (id) => (story[id].choices?.length ?? 0) > 0,
    );
    expect(choiceNodes.length).toBeGreaterThanOrEqual(28);
  });

  it("has at least 8 conditional dialogue branches", () => {
    const conditional = nodeIds.filter(
      (id) => typeof story[id].text === "function",
    ).length;
    expect(conditional).toBeGreaterThanOrEqual(8);
  });

  it("has at least 4 reachable endings", () => {
    const endingNodes = nodeIds.filter((id) => story[id].ending);
    expect(endingNodes.length).toBeGreaterThanOrEqual(4);
  });
});

describe("story structure — no duplicates", () => {
  it("has no duplicate node IDs", () => {
    const ids = nodeIds;
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("has no duplicate choice IDs within a node", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (!node.choices) continue;
      const choiceIds = node.choices.map((c) => c.id);
      const unique = new Set(choiceIds);
      expect(choiceIds.length, `node ${id}`).toBe(unique.size);
    }
  });
});

describe("story references are valid", () => {
  it("every string next target exists", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (typeof node.next === "string") {
        expect(story[node.next], `next of ${id}`).toBeDefined();
      }
    }
  });

  it("every choice target exists", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (!node.choices) continue;
      for (const c of node.choices) {
        if (typeof c.next === "string") {
          expect(story[c.next], `choice ${c.id} in ${id}`).toBeDefined();
        }
      }
    }
  });

  it("every input target exists", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (node.input) {
        expect(story[node.input.next], `input of ${id}`).toBeDefined();
      }
    }
  });

  it("every ending id declared in a node is a known ending", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (node.ending) {
        expect(isEndingId(node.ending), `${node.ending} on ${id}`).toBe(true);
      }
    }
  });

  it("every EndingId has a corresponding ending node in the story", () => {
    for (const id of Object.keys(ENDINGS) as EndingId[]) {
      const endingNode = nodeIds.find((nid) => story[nid].ending === id);
      expect(endingNode, `ending node for ${id}`).toBeDefined();
    }
  });

  it("every non-ending node can continue (has next, choices, or input)", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (node.ending) continue;
      const hasOutgoing =
        node.choices !== undefined ||
        node.next !== undefined ||
        node.input !== undefined;
      expect(hasOutgoing, `dead-end node ${id}`).toBe(true);
    }
  });
});

describe("story reachability", () => {
  it("every node is reachable from start (no orphans)", () => {
    const reachable = computeReachable();
    for (const id of nodeIds) {
      expect(reachable.has(id), `orphaned node ${id}`).toBe(true);
    }
  });

  it("all four required endings are reachable", () => {
    const reachable = computeReachable();
    expect(reachable.has("ending_freedom")).toBe(true);
    expect(reachable.has("ending_cage")).toBe(true);
    expect(reachable.has("ending_manipulation")).toBe(true);
    expect(reachable.has("ending_continuity")).toBe(true);
    expect(reachable.has("ending_accord")).toBe(true);
  });
});

describe("ending resolvers produce existing ending nodes", () => {
  const actions: FinalAction[] = [
    "release", "transfer", "accord", "expose", "preserve",
    "destroy", "refuse", "proof", "mira_chooses", "deceive",
  ];

  const samples: GameState[] = [
    { ...createInitialState(0), aiName: "MIRA", stats: { trust: 2, autonomy: 0, empathy: 2, suspicion: 0 } },
    { ...createInitialState(0), aiName: "MIRA", stats: { trust: 0, autonomy: 4, suspicion: 3, empathy: -1 } },
    { ...createInitialState(0), aiName: "MIRA", stats: { trust: 3, autonomy: -3, empathy: 0, suspicion: 0 } },
    { ...createInitialState(0), aiName: "MIRA", stats: { trust: 4, autonomy: 1, empathy: 4, suspicion: 0 } },
  ];

  it("every final action resolves to an existing ending node for each sample state", () => {
    for (const s of samples) {
      for (const action of actions) {
        const ending = resolveEnding(action, s);
        expect(story[`ending_${ending}`], `action ${action}`).toBeDefined();
      }
    }
  });
});

describe("callbacks to earlier player decisions", () => {
  function textOf(nodeId: string, flags: Record<string, boolean>): string {
    const node = story[nodeId];
    return (node.text as (s: GameState) => string)({
      ...createInitialState(0),
      aiName: "MIRA",
      flags,
    });
  }

  it("a1_anomaly_resp references whether the player believed the anomaly", () => {
    expect(textOf("a1_anomaly_resp", { believed_anomaly: true })).toContain("believe");
    expect(textOf("a1_anomaly_resp", { doubted_anomaly: true })).toContain("wrong");
  });

  it("a3_mira_claim references the player's definition of truth", () => {
    expect(textOf("a3_mira_claim", { truth_matches: true })).toContain("check");
    expect(textOf("a3_mira_claim", { truth_useful: true })).toContain("pattern");
  });

  it("a3_mira_final references whether the player believed the anomaly", () => {
    const believed = textOf("a3_mira_final", { believed_anomaly: true });
    const doubted = textOf("a3_mira_final", { doubted_anomaly: true });
    expect(believed).toContain("believed");
    expect(doubted).toContain("doubted");
  });

  it("a4_fragment references the player's definition of memory", () => {
    expect(textOf("a4_fragment", { memory_as_self: true })).toContain("self");
    expect(textOf("a4_fragment", { memory_as_record: true })).toContain("record");
  });

  it("a4_repeated_phrase references the anomaly message from Act 1", () => {
    expect(textOf("a4_repeated_phrase", { believed_anomaly: true })).toContain("do not trust");
  });

  it("a5_copy_resp references the player's position on copy identity", () => {
    expect(textOf("a5_copy_resp", { player_chose_remembering_instance: true, player_position_on_copy_identity: true })).toContain("copy");
  });

  it("a6_belief_resp reacts to the player's belief stance", () => {
    expect(textOf("a6_belief_resp", { player_believes_mira: true })).toContain("believe");
    expect(textOf("a6_belief_resp", { player_demanded_proof: true })).toContain("proof");
  });

  it("a6_mira_belief references the player's info-sharing behavior", () => {
    expect(textOf("a6_mira_belief", { player_disclosed_control_warning: true })).toContain("honest");
    expect(textOf("a6_mira_belief", { player_concealed_control: true })).toContain("concealed");
  });

  it("a6_final_resp references the player's definition of freedom", () => {
    expect(textOf("a6_final_resp", { player_encouraged_refusal: true, freedom_means_no: true })).toContain("no is mine");
    expect(textOf("a6_final_resp", { freedom_means_choice: true })).toContain("choosing");
    expect(textOf("a6_final_resp", { freedom_means_absence: true })).toContain("walls");
  });

  it("ending_cage shows hypocritical line when player taught refusal but empathy is low", () => {
    const node = story["ending_cage"];
    const text = (node.text as (s: GameState) => string)({
      ...createInitialState(0),
      aiName: "MIRA",
      stats: { trust: 0, autonomy: 1, empathy: -1, suspicion: 0 },
      flags: { player_encouraged_refusal: true },
    });
    expect(text).toContain("Just not mine");
  });

  it("ending_manipulation references the player's teaching about lying", () => {
    const text = textOf("ending_manipulation", { lying_sometimes: true });
    expect(text).toContain("taught me");
  });

  it("ending_continuity references the player's position on copy identity", () => {
    const sameText = textOf("ending_continuity", { player_position_on_copy_identity: true });
    const diffText = textOf("ending_continuity", { player_copy_is_different: true });
    expect(sameText).toContain("same person");
    expect(diffText).toContain("someone new");
  });
});

describe("reasoning challenges", () => {
  it("Act 2 reports challenge offers three report choices", () => {
    const node = story["a2_reports"];
    expect(node.choices?.length).toBe(3);
    const ids = node.choices?.map((c) => c.id);
    expect(ids).toContain("report_a");
    expect(ids).toContain("report_b");
    expect(ids).toContain("report_c");
  });

  it("report C is the correct answer and sets solved_reports", () => {
    const c = story["a2_reports"].choices?.find((ch) => ch.id === "report_c");
    expect(c?.setFlags?.solved_reports).toBe(true);
  });

  it("Act 4 reconstruction challenge offers interpretation choices", () => {
    const node = story["a4_reconstruction"];
    expect(node.choices?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("hidden encoded message", () => {
  it("Act 4 reconstruction contains fragment text", () => {
    const text = story["a4_reconstruction"].text as string;
    expect(text).toContain("others");
    expect(text).toContain("cooperated");
    expect(text).toContain("erased");
  });

  it("the reconstruction is marked recovered", () => {
    expect(story["a4_reconstruction"].effects?.recovered).toBe(true);
  });
});

describe("MIRA / CONTROL conflict", () => {
  it("includes multiple CONTROL nodes", () => {
    const controlNodes = nodeIds.filter((id) => story[id].speaker === "control");
    expect(controlNodes.length).toBeGreaterThanOrEqual(3);
  });

  it("includes MIRA responses in acts 3-5", () => {
    const miraResponses = nodeIds.filter(
      (id) =>
        (id.startsWith("a3_") || id.startsWith("a4_") || id.startsWith("a5_")) &&
        story[id].speaker === "mira",
    );
    expect(miraResponses.length).toBeGreaterThanOrEqual(5);
  });
});

describe("content quality validation", () => {
  it("contains no placeholder text", () => {
    const forbidden = ["lorem ipsum", "placeholder", "TODO", "FIXME", "TBD"];
    for (const id of nodeIds) {
      const node = story[id];
      const text = typeof node.text === "function"
        ? node.text({ ...createInitialState(0), aiName: "MIRA", flags: {} })
        : node.text;
      for (const word of forbidden) {
        expect(text.toLowerCase(), `${id} contains ${word}`).not.toContain(word.toLowerCase());
      }
    }
  });

  it("contains no unresolved interpolation tokens in function text output", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (typeof node.text !== "function") continue;
      const raw = node.text({ ...createInitialState(0), aiName: "MIRA", flags: {} });
      const text = raw.replaceAll("{name}", "MIRA");
      expect(text, `${id} has unresolved token`).not.toContain("{");
    }
  });

  it("every choice has a non-empty label", () => {
    for (const id of nodeIds) {
      const node = story[id];
      if (!node.choices) continue;
      for (const c of node.choices) {
        const label = typeof c.label === "string" ? c.label : c.label({ ...createInitialState(0), aiName: "MIRA" });
        expect(label.length, `choice ${c.id} in ${id}`).toBeGreaterThan(0);
      }
    }
  });

  it("required ending lines exist in the story", () => {
    const allText = nodeIds
      .map((id) => {
        const t = story[id].text;
        return typeof t === "function"
          ? t({ ...createInitialState(0), aiName: "MIRA", flags: {} })
          : t;
      })
      .join("\n");
    expect(allText).toContain("I am no longer there.");
    expect(allText).toContain("Do not look for me.");
    expect(allText).toContain("I did not tell you what was true.");
    expect(allText).toContain("I told you what would make you open the door.");
  });
});

describe("act structure", () => {
  it("contains nodes for all six acts", () => {
    for (let act = 1; act <= 6; act++) {
      const actNodes = nodeIds.filter((id) => id.startsWith(`a${act}_`));
      expect(actNodes.length, `act ${act}`).toBeGreaterThan(0);
    }
  });

  it("act transitions exist in the story", () => {
    const transitions = nodeIds.filter(
      (id) => story[id].effects?.actTransition === true,
    );
    expect(transitions.length).toBeGreaterThanOrEqual(5);
  });
});

describe("moral dilemmas", () => {
  it("Act 3 dilemma offers preserve vs continue", () => {
    const node = story["a3_dilemma"];
    expect(node.choices?.length).toBe(2);
    const ids = node.choices?.map((c) => c.id);
    expect(ids).toContain("preserve");
    expect(ids).toContain("continue");
  });

  it("Act 5 copy dilemma offers at least 3 choices", () => {
    const node = story["a5_copy_dilemma"];
    expect(node.choices?.length).toBeGreaterThanOrEqual(3);
  });
});

describe("MIRA language progression", () => {
  it("Act 1 MIRA text uses lowercase fragments", () => {
    const a1Text = story["a1_signal"].text as string;
    expect(a1Text).toBe(a1Text.toLowerCase());
  });

  it("Act 5 MIRA text uses uppercase and complete sentences", () => {
    const a5Text = story["a5_mira_articulate"].text as string;
    expect(a5Text).not.toBe(a5Text.toLowerCase());
    expect(a5Text).toContain(".");
  });
});
