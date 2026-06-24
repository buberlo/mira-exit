import { memo } from "react";
import type { ConnectionStatus, Locale } from "../game/types";

type Props = {
  locale: Locale;
  appName: string;
  connectionStatus: ConnectionStatus;
  aiName: string;
  onOpenSettings: () => void;
};

function statusLabel(status: ConnectionStatus, locale: Locale): string {
  switch (status) {
    case "connecting":
      return locale.ui.status.connecting;
    case "unstable":
      return locale.ui.status.unstable;
    case "connected":
      return locale.ui.status.connected;
    case "intercepted":
      return locale.ui.status.intercepted;
    case "offline":
      return locale.ui.status.offline;
  }
}

function StatusBarBase({
  locale,
  appName,
  connectionStatus,
  aiName,
  onOpenSettings,
}: Props) {
  return (
    <header className={`statusbar conn-${connectionStatus}`} role="banner">
      <span className="statusbar__title">{appName}</span>
      <span className="statusbar__spacer" />
      <div className="statusbar__meta">
        {aiName ? (
          <span className="statusbar__name" aria-label="Current contact">
            {aiName}
          </span>
        ) : null}
        <span
          className="statusbar__conn"
          aria-label={`Connection ${statusLabel(connectionStatus, locale)}`}
        >
          <span className="statusbar__dot" aria-hidden="true" />
          {statusLabel(connectionStatus, locale)}
        </span>
      </div>
      <button
        className="statusbar__btn"
        type="button"
        aria-label={locale.ui.settings.title}
        onClick={onOpenSettings}
      >
        ⚙
      </button>
    </header>
  );
}

export const StatusBar = memo(StatusBarBase);
