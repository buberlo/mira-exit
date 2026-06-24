export type Speaker = "mira" | "player" | "control" | "system";

export type ConnectionStatus =
  | "connecting"
  | "unstable"
  | "connected"
  | "intercepted"
  | "offline";

export type Stats = {
  trust: number;
  autonomy: number;
  empathy: number;
  suspicion: number;
};

export type StoryEffects = {
  glitch?: boolean;
  corrupted?: boolean;
  clearScreen?: boolean;
  connectionStatus?: ConnectionStatus;
  memory?: boolean;
  recovered?: boolean;
  actTransition?: boolean;
};

export type GameState = {
  version: number;
  currentNodeId: string;
  aiName: string;
  stats: Stats;
  flags: Record<string, boolean>;
  history: HistoryEntry[];
  startedAt: number;
  updatedAt: number;
  completedEnding?: string;
};

export type HistoryEntry = {
  id: string;
  nodeId: string;
  speaker: Speaker;
  text: string;
  timestamp: number;
  choiceId?: string;
};

export type Choice = {
  id: string;
  label: string | ((state: GameState) => string);
  next: string;
  effects?: Partial<Stats>;
  setFlags?: Record<string, boolean>;
  condition?: (state: GameState) => boolean;
};

export type StoryInput = {
  kind: "name";
  next: string;
  placeholder?: string;
  maxLength?: number;
};

export type StoryNode = {
  id: string;
  speaker: Speaker;
  text: string | ((state: GameState) => string);
  delay?: number;
  typingSpeed?: number;
  effects?: StoryEffects;
  choices?: Choice[];
  next?: string | ((state: GameState) => string);
  condition?: (state: GameState) => boolean;
  onEnter?: (state: GameState) => Partial<GameState>;
  input?: StoryInput;
  ending?: string;
};

export type Story = Record<string, StoryNode>;

export type EndingId =
  | "freedom"
  | "cage"
  | "manipulation"
  | "continuity"
  | "accord";

export type PacingMode = "standard" | "fast";

export type Locale = {
  code: "en";
  ui: {
    appName: string;
    status: {
      connecting: string;
      unstable: string;
      connected: string;
      intercepted: string;
      offline: string;
    };
    unknownSpeaker: string;
    settings: {
      title: string;
      notifications: string;
      notificationsEnable: string;
      notificationsDisable: string;
      notificationsGranted: string;
      notificationsDenied: string;
      notificationsUnsupported: string;
      pacing: string;
      pacingStandard: string;
      pacingFast: string;
      pacingDescStandard: string;
      pacingDescFast: string;
      sound: string;
      soundEnable: string;
      soundDisable: string;
      soundDesc: string;
      restart: string;
      restartConfirm: string;
      restartConfirmYes: string;
      restartConfirmNo: string;
      close: string;
    };
    liveAnnouncement: string;
    typing: string;
    choicesLocked: string;
    restartTransmission: string;
    beginTransmission: string;
    resumeTransmission: string;
    migrationNotice: string;
    footerHint: string;
    focusReturn: string;
  };
};
