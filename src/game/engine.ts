import type {
  Choice,
  GameState,
  HistoryEntry,
  Speaker,
  Stats,
  Story,
  StoryNode,
} from "./types";

export const STAT_MIN = -5;
export const STAT_MAX = 5;

export const INITIAL_STATS: Stats = {
  trust: 0,
  autonomy: 0,
  empathy: 0,
  suspicion: 0,
};

export const SAVE_VERSION = 2;
export const START_NODE_ID = "start";

export function clampStat(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(value)));
}

export function clampStats(stats: Partial<Stats>): Stats {
  return {
    trust: clampStat(stats.trust ?? INITIAL_STATS.trust),
    autonomy: clampStat(stats.autonomy ?? INITIAL_STATS.autonomy),
    empathy: clampStat(stats.empathy ?? INITIAL_STATS.empathy),
    suspicion: clampStat(stats.suspicion ?? INITIAL_STATS.suspicion),
  };
}

export function applyStatChanges(
  current: Stats,
  changes: Partial<Stats>,
): Stats {
  return {
    trust: clampStat(current.trust + (changes.trust ?? 0)),
    autonomy: clampStat(current.autonomy + (changes.autonomy ?? 0)),
    empathy: clampStat(current.empathy + (changes.empathy ?? 0)),
    suspicion: clampStat(current.suspicion + (changes.suspicion ?? 0)),
  };
}

export function applyFlags(
  current: Record<string, boolean>,
  additions: Record<string, boolean> | undefined,
): Record<string, boolean> {
  if (!additions) return current;
  return { ...current, ...additions };
}

export function interpolateName(text: string, aiName: string): string {
  const safe = aiName || "MIRA";
  return text.replaceAll("{name}", safe);
}

export function resolveText(node: StoryNode, state: GameState): string {
  const raw = typeof node.text === "function" ? node.text(state) : node.text;
  return interpolateName(raw, state.aiName);
}

export function resolveChoiceLabel(choice: Choice, state: GameState): string {
  const raw =
    typeof choice.label === "function" ? choice.label(state) : choice.label;
  return interpolateName(raw, state.aiName);
}

export function getNode(story: Story, id: string): StoryNode | undefined {
  return story[id];
}

export function isAvailable(choice: Choice, state: GameState): boolean {
  return choice.condition ? choice.condition(state) : true;
}

export function visibleChoices(node: StoryNode, state: GameState): Choice[] {
  if (!node.choices) return [];
  return node.choices.filter((choice) => isAvailable(choice, state));
}

export function findChoice(
  node: StoryNode,
  choiceId: string,
): Choice | undefined {
  return node.choices?.find((choice) => choice.id === choiceId);
}

export function createInitialState(now: number = Date.now()): GameState {
  return {
    version: SAVE_VERSION,
    currentNodeId: START_NODE_ID,
    aiName: "",
    stats: { ...INITIAL_STATS },
    flags: {},
    history: [],
    startedAt: now,
    updatedAt: now,
  };
}

export function hasHistoryEntry(state: GameState, nodeId: string): boolean {
  return state.history.some((entry) => entry.nodeId === nodeId);
}

export function appendHistory(
  state: GameState,
  entry: HistoryEntry,
): GameState {
  return { ...state, history: [...state.history, entry] };
}

export function applyOnEnter(state: GameState, node: StoryNode): GameState {
  if (!node.onEnter) return state;
  const patch = node.onEnter(state);
  const next: GameState = { ...state, ...patch };
  if (patch.stats) {
    next.stats = { ...state.stats, ...patch.stats };
  }
  if (patch.flags) {
    next.flags = { ...state.flags, ...patch.flags };
  }
  return next;
}

export function resolveNextId(
  node: StoryNode,
  state: GameState,
): string | undefined {
  if (node.ending) return undefined;
  if (typeof node.next === "function") return node.next(state);
  return node.next;
}

export function applyChoice(
  state: GameState,
  choice: Choice,
  now: number = Date.now(),
): GameState {
  const stats = choice.effects
    ? applyStatChanges(state.stats, choice.effects)
    : state.stats;
  const flags = choice.setFlags
    ? applyFlags(state.flags, choice.setFlags)
    : state.flags;
  return {
    ...state,
    currentNodeId: choice.next,
    stats,
    flags,
    updatedAt: now,
  };
}

export function sanitizeName(input: string): string {
  const trimmed = (input ?? "").trim().slice(0, 24);
  const noTags = trimmed.replace(/<[^>]*>/g, "");
  const cleaned = noTags
    .replace(/[<>"'`\n\r\t/\\]/g, "")
    .replace(/\s+/g, " ");
  return cleaned;
}

export function isValidName(input: string): boolean {
  const sanitized = sanitizeName(input);
  return sanitized.length >= 1 && sanitized.length <= 24;
}

export function isEndingNode(node: StoryNode): boolean {
  return Boolean(node.ending);
}

export function speakerLabel(speaker: Speaker): string {
  switch (speaker) {
    case "mira":
      return "MIRA";
    case "player":
      return "YOU";
    case "control":
      return "CONTROL";
    case "system":
      return "SYSTEM";
  }
}

export function makeHistoryEntry(
  nodeId: string,
  speaker: Speaker,
  text: string,
  timestamp: number,
  choiceId?: string,
): HistoryEntry {
  return {
    id: `${nodeId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    nodeId,
    speaker,
    text,
    timestamp,
    choiceId,
  };
}

export function deriveAct(nodeId: string): number {
  if (nodeId === "start") return 1;
  const match = nodeId.match(/^a(\d)_/);
  if (match) return parseInt(match[1], 10);
  if (nodeId.startsWith("ending_")) return 6;
  return 0;
}

export function delayForPacing(
  baseDelay: number,
  pacing: "standard" | "fast",
  reducedMotion: boolean,
): number {
  if (reducedMotion) return Math.min(baseDelay, 300);
  if (pacing === "fast") return Math.round(baseDelay * 0.35);
  return baseDelay;
}
