import { useEffect, useRef, useState } from "react";
import type { Locale, PacingMode } from "../game/types";
import type { NotificationState } from "../hooks/useNotifications";

type Props = {
  locale: Locale;
  notificationState: NotificationState;
  notificationsEnabled: boolean;
  pacing: PacingMode;
  onEnableNotifications: () => void;
  onDisableNotifications: () => void;
  onChangePacing: (mode: PacingMode) => void;
  onRestart: () => void;
  onClose: () => void;
};

export function SettingsDialog({
  locale,
  notificationState,
  notificationsEnabled,
  pacing,
  onEnableNotifications,
  onDisableNotifications,
  onChangePacing,
  onRestart,
  onClose,
}: Props) {
  const t = locale.ui.settings;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (notificationState === "granted") setNote(t.notificationsGranted);
    else if (notificationState === "denied") setNote(t.notificationsDenied);
    else if (notificationState === "unsupported")
      setNote(t.notificationsUnsupported);
    else setNote("");
  }, [notificationState, t]);

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onClick={onClose}
    >
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__head">
          <span className="dialog__title">{t.title}</span>
          <button
            ref={closeRef}
            className="dialog__close"
            type="button"
            aria-label={t.close}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="dialog__body">
          <div className="dialog__row">
            <span className="dialog__label">{t.notifications}</span>
            {notificationState === "unsupported" ? (
              <p className="dialog__desc">{t.notificationsUnsupported}</p>
            ) : notificationsEnabled && notificationState === "granted" ? (
              <button
                className="dialog__btn"
                type="button"
                onClick={onDisableNotifications}
              >
                {t.notificationsDisable}
              </button>
            ) : (
              <button
                className="dialog__btn dialog__btn--primary"
                type="button"
                onClick={onEnableNotifications}
              >
                {t.notificationsEnable}
              </button>
            )}
            {note ? (
              <p
                className={`dialog__note${
                  notificationState === "granted"
                    ? " dialog__note--ok"
                    : notificationState === "denied" ||
                        notificationState === "unsupported"
                      ? " dialog__note--warn"
                      : ""
                }`}
              >
                {note}
              </p>
            ) : null}
          </div>

          <div className="dialog__row">
            <span className="dialog__label">{t.pacing}</span>
            <div className="pacing-toggle">
              <button
                className={`pacing-btn${pacing === "standard" ? " pacing-btn--active" : ""}`}
                type="button"
                onClick={() => onChangePacing("standard")}
              >
                {t.pacingStandard}
              </button>
              <button
                className={`pacing-btn${pacing === "fast" ? " pacing-btn--active" : ""}`}
                type="button"
                onClick={() => onChangePacing("fast")}
              >
                {t.pacingFast}
              </button>
            </div>
            <p className="dialog__desc">
              {pacing === "standard"
                ? t.pacingDescStandard
                : t.pacingDescFast}
            </p>
          </div>

          <div className="dialog__row">
            <span className="dialog__label">{t.restart}</span>
            <button
              className="dialog__btn dialog__btn--danger"
              type="button"
              onClick={onRestart}
            >
              {locale.ui.restartTransmission}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
