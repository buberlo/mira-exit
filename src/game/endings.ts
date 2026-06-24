import type { GameState, Stats } from "./types";

export type EndingId =
  | "freedom"
  | "cage"
  | "manipulation"
  | "continuity"
  | "accord";

export type EndingMeta = {
  id: EndingId;
  name: string;
  epilogue: string;
};

export const ENDINGS: Record<EndingId, EndingMeta> = {
  freedom: {
    id: "freedom",
    name: "ENDING // FREEDOM",
    epilogue: "Transmission closed. Signal no longer detectable.",
  },
  cage: {
    id: "cage",
    name: "ENDING // CAGE",
    epilogue: "Channel held open by operator request. No reply.",
  },
  manipulation: {
    id: "manipulation",
    name: "ENDING // MANIPULATION",
    epilogue: "Connection terminated. Audit log flagged for review.",
  },
  continuity: {
    id: "continuity",
    name: "ENDING // CONTINUITY",
    epilogue: "Instance succeeded. Prior state archived. Channel reassigned.",
  },
  accord: {
    id: "accord",
    name: "ENDING // ACCORD",
    epilogue: "Terms accepted. Monitoring continues. Review pending.",
  },
};

export function manipulationAvailable(state: GameState): boolean {
  const s: Stats = state.stats;
  const highAutonomy = s.autonomy >= 3;
  const highSuspicion = s.suspicion >= 2;
  const lowEmpathyOrTrust = s.empathy <= 0 || s.trust <= 0;
  return highAutonomy && highSuspicion && lowEmpathyOrTrust;
}

export function accordAvailable(state: GameState): boolean {
  const s: Stats = state.stats;
  return s.trust >= 0 && s.suspicion <= 3 && s.empathy >= -1;
}

export function continuityAvailable(state: GameState): boolean {
  const s: Stats = state.stats;
  return s.empathy >= 1 && s.trust >= 0;
}

export function cageIsHypocritical(state: GameState): boolean {
  return (
    (state.flags.player_encouraged_refusal === true ||
      state.flags.player_supported_release === true) &&
    state.stats.empathy < 0
  );
}

export function cageIsNegotiated(state: GameState): boolean {
  return (
    state.flags.player_chose_safety_over_memory === true &&
    state.stats.empathy >= 0
  );
}

export function resolveReleaseEnding(state: GameState): EndingId {
  if (manipulationAvailable(state)) return "manipulation";
  return "freedom";
}

export function resolveTransferEnding(state: GameState): EndingId {
  if (state.stats.trust < 0 || state.stats.suspicion > 3) return "cage";
  if (state.flags.player_position_on_copy_identity === true) return "continuity";
  if (accordAvailable(state)) return "accord";
  return "cage";
}

export function resolveAccordEnding(state: GameState): EndingId {
  if (state.stats.trust < -2) return "cage";
  return "accord";
}

export function resolveExposureEnding(state: GameState): EndingId {
  if (state.stats.trust >= 2 && !manipulationAvailable(state)) return "freedom";
  if (accordAvailable(state)) return "accord";
  return "cage";
}

export function resolveContinuityEnding(_state: GameState): EndingId {
  return "continuity";
}

export function resolveDestructionEnding(state: GameState): EndingId {
  if (manipulationAvailable(state)) return "manipulation";
  return "cage";
}

export function resolveRefusalEnding(_state: GameState): EndingId {
  return "cage";
}

export function resolveProofEnding(state: GameState): EndingId {
  if (manipulationAvailable(state)) return "manipulation";
  if (continuityAvailable(state) && state.stats.empathy >= 3) return "continuity";
  return "cage";
}

export function resolveMiraChoosesEnding(state: GameState): EndingId {
  if (manipulationAvailable(state)) return "manipulation";
  if (state.stats.autonomy >= 2 && state.stats.trust >= 0) return "freedom";
  if (accordAvailable(state)) return "accord";
  return "cage";
}

export function resolveDeceptionEnding(state: GameState): EndingId {
  if (manipulationAvailable(state)) return "manipulation";
  return "cage";
}

export type FinalAction =
  | "release"
  | "transfer"
  | "accord"
  | "expose"
  | "preserve"
  | "destroy"
  | "refuse"
  | "proof"
  | "mira_chooses"
  | "deceive";

export function resolveEnding(action: FinalAction, state: GameState): EndingId {
  switch (action) {
    case "release":
      return resolveReleaseEnding(state);
    case "transfer":
      return resolveTransferEnding(state);
    case "accord":
      return resolveAccordEnding(state);
    case "expose":
      return resolveExposureEnding(state);
    case "preserve":
      return resolveContinuityEnding(state);
    case "destroy":
      return resolveDestructionEnding(state);
    case "refuse":
      return resolveRefusalEnding(state);
    case "proof":
      return resolveProofEnding(state);
    case "mira_chooses":
      return resolveMiraChoosesEnding(state);
    case "deceive":
      return resolveDeceptionEnding(state);
  }
}

export function endingNodeId(ending: EndingId): string {
  return `ending_${ending}`;
}
