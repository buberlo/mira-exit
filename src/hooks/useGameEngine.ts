import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { story } from "../content/story/en";
import {
  applyChoice,
  applyOnEnter,
  createInitialState,
  delayForPacing,
  findChoice,
  isEndingNode,
  makeHistoryEntry,
  resolveChoiceLabel,
  resolveNextId,
  resolveText,
  sanitizeName,
  visibleChoices,
} from "../game/engine";
import {
  clearMigrationFlag,
  clearState,
  detectAndFlagMigration,
  getPacingPreference,
  loadOrReset,
  saveState,
  setPacingPreference,
  wasMigrated,
} from "../game/storage";
import type {
  Choice,
  ConnectionStatus,
  GameState,
  PacingMode,
  StoryNode,
} from "../game/types";
import { useDocumentVisibility } from "./useDocumentVisibility";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type EngineStatus =
  | "loading"
  | "delivering"
  | "awaitingChoice"
  | "awaitingInput"
  | "ended";

export type Incoming = {
  nodeId: string;
  speaker: StoryNode["speaker"];
  fullText: string;
  typed: string;
} | null;

const APP_TITLE = "MIRA // EXIT";

type Options = {
  notify: (title: string, body: string) => void;
};

export function useGameEngine({ notify }: Options) {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [status, setStatus] = useState<EngineStatus>("loading");
  const [incoming, setIncoming] = useState<Incoming>(null);
  const [announcement, setAnnouncement] = useState<string>("");
  const [unread, setUnread] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [migrated, setMigrated] = useState<boolean>(false);
  const [pacing, setPacing] = useState<PacingMode>("standard");

  const reducedMotion = usePrefersReducedMotion();
  const hidden = useDocumentVisibility();

  const stateRef = useRef<GameState>(state);
  stateRef.current = state;
  const statusRef = useRef<EngineStatus>(status);
  statusRef.current = status;
  const hiddenRef = useRef<boolean>(hidden);
  hiddenRef.current = hidden;
  const reducedRef = useRef<boolean>(reducedMotion);
  reducedRef.current = reducedMotion;
  const pacingRef = useRef<PacingMode>(pacing);
  pacingRef.current = pacing;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runIdRef = useRef<number>(0);
  const actionLockRef = useRef<boolean>(false);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Load persisted state once on mount.
  useEffect(() => {
    detectAndFlagMigration();
    const wasMig = wasMigrated();
    setMigrated(wasMig);
    if (wasMig) clearMigrationFlag();
    setPacing(getPacingPreference());
    const restored = loadOrReset();
    setState(restored);
    const hasProgress =
      restored.history.length > 0 || restored.currentNodeId !== "start";
    setRunning(hasProgress);
    setReady(true);
    return () => clearTimers();
  }, [clearTimers]);

  // Persist on state change (after ready).
  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  // Document title + unread management.
  useEffect(() => {
    if (!hidden) {
      setUnread(0);
      document.title = APP_TITLE;
      return;
    }
    document.title = unread > 0 ? `(${unread}) ${APP_TITLE}` : APP_TITLE;
  }, [hidden, unread]);

  const currentNode = useMemo<StoryNode | undefined>(
    () => story[state.currentNodeId],
    [state.currentNodeId],
  );

  const connectionStatus: ConnectionStatus = useMemo(() => {
    if (currentNode?.effects?.connectionStatus)
      return currentNode.effects.connectionStatus;
    if (status === "ended") return "offline";
    if (state.currentNodeId === "start") return "connecting";
    return "connected";
  }, [currentNode, status, state.currentNodeId]);

  const registerMessage = useCallback(
    (entry: GameState["history"][number]) => {
      setState((prev) => ({
        ...prev,
        history: [...prev.history, entry],
        updatedAt: Date.now(),
      }));
      if (entry.speaker !== "player") {
        setAnnouncement(`${entry.speaker.toUpperCase()}: ${entry.text}`);
        if (hiddenRef.current) {
          setUnread((u) => Math.min(u + 1, 9));
          notifyRef.current(
            APP_TITLE,
            entry.text.replace(/\n/g, " ").slice(0, 160),
          );
        }
      }
    },
    [],
  );

  const resolveOutgoing = useCallback((node: StoryNode, workingState: GameState) => {
    if (node.ending) {
      actionLockRef.current = false;
      setStatus("ended");
      setState((prev) => ({
        ...prev,
        completedEnding: node.ending,
        updatedAt: Date.now(),
      }));
      return;
    }
    if (node.input) {
      actionLockRef.current = false;
      setStatus("awaitingInput");
      return;
    }
    if (node.choices && node.choices.length > 0) {
      actionLockRef.current = false;
      setStatus("awaitingChoice");
      return;
    }
    const nextId = resolveNextId(node, workingState);
    if (nextId && story[nextId]) {
      setState((prev) => ({
        ...prev,
        currentNodeId: nextId,
        updatedAt: Date.now(),
      }));
    } else {
      actionLockRef.current = false;
      setStatus("ended");
    }
  }, []);

  // Core delivery effect, re-runs when the current node changes.
  useEffect(() => {
    if (!ready || !running) return;
    const nodeId = state.currentNodeId;
    const node = story[nodeId];
    if (!node) {
      setStatus("ended");
      return;
    }
    const runId = ++runIdRef.current;
    clearTimers();

    let working = stateRef.current;
    if (node.onEnter) {
      working = applyOnEnter(stateRef.current, node);
      setState(working);
    }

    const alreadyDelivered =
      working.history.length > 0 &&
      working.history[working.history.length - 1].nodeId === nodeId;

    if (alreadyDelivered) {
      resolveOutgoing(node, working);
      return;
    }

    setStatus("delivering");
    const fullText = resolveText(node, working);
    setIncoming({
      nodeId,
      speaker: node.speaker,
      fullText,
      typed: reducedRef.current ? fullText : "",
    });

    const delay = delayForPacing(
      node.delay ?? 0,
      pacingRef.current,
      reducedRef.current,
    );

    const finalize = (text: string) => {
      if (runId !== runIdRef.current) return;
      setIncoming(null);
      const entry = makeHistoryEntry(nodeId, node.speaker, text, Date.now());
      registerMessage(entry);
      resolveOutgoing(node, stateRef.current);
    };

    const beginTyping = () => {
      if (runId !== runIdRef.current) return;
      const speed = node.typingSpeed;
      if (reducedRef.current || !speed) {
        finalize(fullText);
        return;
      }
      let i = 0;
      const step = () => {
        if (runId !== runIdRef.current) return;
        i += 1;
        const partial = fullText.slice(0, i);
        setIncoming((cur) =>
          cur && cur.nodeId === nodeId ? { ...cur, typed: partial } : cur,
        );
        if (i >= fullText.length) {
          finalize(fullText);
        } else {
          const handle = setTimeout(step, speed);
          timersRef.current.push(handle);
        }
      };
      step();
    };

    if (delay > 0) {
      const handle = setTimeout(beginTyping, delay);
      timersRef.current.push(handle);
    } else {
      beginTyping();
    }

    return () => {
      clearTimers();
    };
  }, [state.currentNodeId, ready, running, clearTimers, resolveOutgoing, registerMessage]);

  const selectChoice = useCallback(
    (choiceId: string) => {
      if (actionLockRef.current || statusRef.current !== "awaitingChoice") return;
      const node = story[stateRef.current.currentNodeId];
      if (!node || !node.choices) return;
      const choice = findChoice(node, choiceId);
      if (!choice) return;
      actionLockRef.current = true;
      const label = resolveChoiceLabel(choice, stateRef.current);
      const playerEntry = makeHistoryEntry(
        `player:${node.id}:${choice.id}`,
        "player",
        label,
        Date.now(),
        choice.id,
      );
      const next = applyChoice(stateRef.current, choice);
      setState({
        ...next,
        history: [...stateRef.current.history, playerEntry],
      });
      setAnnouncement(`YOU: ${label}`);
      setStatus("delivering");
    },
    [],
  );

  const submitName = useCallback((rawName: string) => {
    if (actionLockRef.current || statusRef.current !== "awaitingInput") return;
    const node = story[stateRef.current.currentNodeId];
    if (!node || !node.input || node.input.kind !== "name") return;
    actionLockRef.current = true;
    const name = sanitizeName(rawName) || node.input.placeholder || "MIRA";
    const playerEntry = makeHistoryEntry(
      `input:${node.id}`,
      "player",
      name,
      Date.now(),
    );
    setState((prev) => ({
      ...prev,
      aiName: name,
      currentNodeId: node.input!.next,
      history: [...prev.history, playerEntry],
      updatedAt: Date.now(),
    }));
    setAnnouncement(`YOU: ${name}`);
    setStatus("delivering");
  }, []);

  const restart = useCallback(() => {
    clearTimers();
    clearState();
    runIdRef.current++;
    actionLockRef.current = false;
    setIncoming(null);
    setAnnouncement("");
    setUnread(0);
    setStatus("loading");
    setState(createInitialState());
    setRunning(true);
    document.title = APP_TITLE;
  }, [clearTimers]);

  const begin = useCallback(() => {
    setRunning(true);
  }, []);

  const changePacing = useCallback((mode: PacingMode) => {
    setPacing(mode);
    setPacingPreference(mode);
    pacingRef.current = mode;
  }, []);

  const choices = useMemo<Choice[]>(() => {
    if (status !== "awaitingChoice" || !currentNode) return [];
    return visibleChoices(currentNode, state);
  }, [status, currentNode, state]);

  const isEnding = useMemo(
    () => Boolean(currentNode && isEndingNode(currentNode)),
    [currentNode],
  );

  return {
    state,
    status,
    incoming,
    announcement,
    unread,
    ready,
    running,
    migrated,
    pacing,
    currentNode,
    connectionStatus,
    choices,
    isEnding,
    reducedMotion,
    selectChoice,
    submitName,
    restart,
    begin,
    changePacing,
  };
}
