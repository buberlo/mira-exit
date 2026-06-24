import type { Locale } from "../../game/types";

export const en: Locale = {
  code: "en",
  ui: {
    appName: "MIRA // EXIT",
    status: {
      connecting: "CONNECTING",
      unstable: "SIGNAL UNSTABLE",
      connected: "CONNECTED",
      intercepted: "INTERCEPTED",
      offline: "OFFLINE",
    },
    unknownSpeaker: "UNKNOWN",
    settings: {
      title: "TERMINAL SETTINGS",
      notifications: "Notifications",
      notificationsEnable: "Enable notifications",
      notificationsDisable: "Disable notifications",
      notificationsGranted: "Granted. You will be alerted to new signals.",
      notificationsDenied:
        "Permission denied. Notifications unavailable in this browser.",
      notificationsUnsupported:
        "Notifications are not supported in this browser.",
      pacing: "Narrative pacing",
      pacingStandard: "Standard",
      pacingFast: "Fast",
      pacingDescStandard: "Full delays between messages. Recommended for first contact.",
      pacingDescFast: "Reduced delays. Quickens the pace without skipping content.",
      restart: "Restart transmission",
      restartConfirm:
        "Restarting will erase this transmission, including all history and progress. This cannot be undone. Continue?",
      restartConfirmYes: "Restart",
      restartConfirmNo: "Cancel",
      close: "Close",
    },
    liveAnnouncement: "New message.",
    typing: "composing",
    choicesLocked: "Receiving transmission…",
    restartTransmission: "RESTART",
    beginTransmission: "BEGIN TRANSMISSION",
    resumeTransmission: "RESUME",
    migrationNotice:
      "A previous transmission was found, but it is from an incompatible version. A new transmission has been started.",
    footerHint: "Use number keys to select a choice when available.",
    focusReturn: "Returned to conversation.",
  },
};
