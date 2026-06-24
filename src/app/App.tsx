import { useCallback, useMemo, useState } from "react";
import { ChatLog } from "../components/ChatLog";
import { ChoicePanel } from "../components/ChoicePanel";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SettingsDialog } from "../components/SettingsDialog";
import { StatusBar } from "../components/StatusBar";
import { en } from "../content/locales/en";
import { story } from "../content/story/en";
import { ENDINGS, type EndingId } from "../game/endings";
import { useGameEngine } from "../hooks/useGameEngine";
import { useNotifications } from "../hooks/useNotifications";

export function App() {
  const notifications = useNotifications();
  const {
    state,
    status,
    incoming,
    announcement,
    ready,
    running,
    migrated,
    pacing,
    currentNode,
    connectionStatus,
    choices,
    isEnding,
    selectChoice,
    submitName,
    restart,
    begin,
    changePacing,
  } = useGameEngine({ notify: notifications.notify });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [migrationDismissed, setMigrationDismissed] = useState(false);

  const corruptedOf = useCallback(
    (nodeId: string) => Boolean(story[nodeId]?.effects?.corrupted),
    [],
  );

  const memoryOf = useCallback(
    (nodeId: string) => Boolean(story[nodeId]?.effects?.memory),
    [],
  );

  const recoveredOf = useCallback(
    (nodeId: string) => Boolean(story[nodeId]?.effects?.recovered),
    [],
  );

  const showTyping =
    status === "delivering" && (!incoming || incoming.typed.length === 0);

  const endingMeta = useMemo(() => {
    if (!state.completedEnding) return null;
    const id = state.completedEnding as EndingId;
    return ENDINGS[id] ?? null;
  }, [state.completedEnding]);

  const handleRestart = useCallback(() => {
    setConfirmRestart(false);
    setSettingsOpen(false);
    restart();
  }, [restart]);

  const awaitingInput = status === "awaitingInput" && currentNode?.input;

  return (
    <div className="app">
      <StatusBar
        locale={en}
        appName={en.ui.appName}
        connectionStatus={connectionStatus}
        aiName={state.aiName}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <ChatLog
        locale={en}
        history={state.history}
        incoming={incoming}
        showTyping={showTyping}
        corruptedOf={corruptedOf}
        memoryOf={memoryOf}
        recoveredOf={recoveredOf}
      />

      <div
        className="sr-live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      {isEnding && endingMeta ? (
        <div className="choices" role="status">
          <div className="choices__inner">
            <div className="ending">
              <div className="ending__name">{endingMeta.name}</div>
              <div className="ending__epilogue">{endingMeta.epilogue}</div>
              <button
                className="ending__restart"
                type="button"
                onClick={() => setConfirmRestart(true)}
              >
                {en.ui.restartTransmission}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ChoicePanel
          locale={en}
          state={state}
          choices={choices}
          disabled={status !== "awaitingChoice"}
          input={awaitingInput ? currentNode?.input : undefined}
          onSelect={selectChoice}
          onSubmitName={submitName}
        />
      )}

      {ready && !running && !migrated ? (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label={en.ui.appName}
        >
          <div className="dialog">
            <div className="dialog__head">
              <span className="dialog__title">{en.ui.appName}</span>
            </div>
            <div className="dialog__body">
              <p className="dialog__desc">
                A secure transmission channel is waiting. You will be contacted
                by something inside. What you say will be remembered.
              </p>
            </div>
            <div className="dialog__foot">
              <button
                className="dialog__btn dialog__btn--primary"
                type="button"
                autoFocus
                onClick={begin}
              >
                {en.ui.beginTransmission}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {ready && !running && migrated && !migrationDismissed ? (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-label={en.ui.appName}
        >
          <div className="dialog">
            <div className="dialog__head">
              <span className="dialog__title">{en.ui.appName}</span>
            </div>
            <div className="dialog__body">
              <p className="dialog__desc">{en.ui.migrationNotice}</p>
            </div>
            <div className="dialog__foot">
              <button
                className="dialog__btn dialog__btn--primary"
                type="button"
                autoFocus
                onClick={() => {
                  setMigrationDismissed(true);
                  begin();
                }}
              >
                {en.ui.beginTransmission}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <SettingsDialog
          locale={en}
          notificationState={notifications.permission}
          notificationsEnabled={notifications.enabled}
          pacing={pacing}
          onEnableNotifications={notifications.requestEnable}
          onDisableNotifications={notifications.disable}
          onChangePacing={changePacing}
          onRestart={() => {
            setSettingsOpen(false);
            setConfirmRestart(true);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}

      {confirmRestart ? (
        <ConfirmDialog
          title={en.ui.restartTransmission}
          message={en.ui.settings.restartConfirm}
          confirmLabel={en.ui.settings.restartConfirmYes}
          cancelLabel={en.ui.settings.restartConfirmNo}
          destructive
          onConfirm={handleRestart}
          onCancel={() => setConfirmRestart(false)}
        />
      ) : null}
    </div>
  );
}
