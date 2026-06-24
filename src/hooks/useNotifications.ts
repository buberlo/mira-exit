import { useCallback, useEffect, useState } from "react";
import {
  getNotificationPreference,
  setNotificationPreference,
} from "../game/storage";

export type NotificationState = "default" | "granted" | "denied" | "unsupported";

function supported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

function currentPermission(): NotificationState {
  if (!supported()) return "unsupported";
  switch (Notification.permission) {
    case "granted":
      return "granted";
    case "denied":
      return "denied";
    default:
      return "default";
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationState>(
    currentPermission(),
  );
  const [enabled, setEnabled] = useState<boolean>(getNotificationPreference());

  useEffect(() => {
    setEnabled(getNotificationPreference());
  }, []);

  const requestEnable = useCallback(async (): Promise<NotificationState> => {
    if (!supported()) {
      setPermission("unsupported");
      return "unsupported";
    }
    try {
      const result = await Notification.requestPermission();
      const state: NotificationState =
        result === "granted" ? "granted" : result === "denied" ? "denied" : "default";
      setPermission(state);
      if (state === "granted") {
        setNotificationPreference(true);
        setEnabled(true);
      } else {
        setNotificationPreference(false);
        setEnabled(false);
      }
      return state;
    } catch {
      setPermission("denied");
      setNotificationPreference(false);
      setEnabled(false);
      return "denied";
    }
  }, []);

  const disable = useCallback(() => {
    setNotificationPreference(false);
    setEnabled(false);
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      if (!enabled) return;
      if (!supported() || Notification.permission !== "granted") return;
      if (typeof document !== "undefined" && !document.hidden) return;
      try {
        const n = new Notification(title, {
          body,
          silent: false,
          tag: "mira-exit-message",
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch {
        /* ignore */
      }
    },
    [enabled],
  );

  return { permission, enabled, requestEnable, disable, notify };
}
