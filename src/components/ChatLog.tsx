import { useEffect, useRef } from "react";
import type { HistoryEntry, Locale } from "../game/types";
import type { Incoming } from "../hooks/useGameEngine";
import { GlitchText } from "./GlitchText";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  locale: Locale;
  history: HistoryEntry[];
  incoming: Incoming;
  showTyping: boolean;
  corruptedOf: (nodeId: string) => boolean;
  memoryOf: (nodeId: string) => boolean;
  recoveredOf: (nodeId: string) => boolean;
};

export function ChatLog({
  locale,
  history,
  incoming,
  showTyping,
  corruptedOf,
  memoryOf,
  recoveredOf,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history.length, incoming?.typed, showTyping]);

  return (
    <main className="chat" id="chat-log" aria-label="Message history">
      <div className="chat__inner">
        {history.map((entry) => (
          <Message
            key={entry.id}
            entry={entry}
            locale={locale}
            corrupted={corruptedOf(entry.nodeId)}
            memory={memoryOf(entry.nodeId)}
            recovered={recoveredOf(entry.nodeId)}
          />
        ))}

        {incoming && incoming.typed.length > 0 ? (
          <div
            className={`msg msg--${incoming.speaker}${
              corruptedOf(incoming.nodeId) ? " msg--corrupted" : ""
            }${memoryOf(incoming.nodeId) ? " msg--memory" : ""}${
              recoveredOf(incoming.nodeId) ? " msg--recovered" : ""
            }`}
          >
            <div className="msg__head">
              <span className="msg__speaker" aria-hidden="true">
                {incoming.speaker.toUpperCase()}
              </span>
            </div>
            <div className="msg__body" aria-hidden="true">
              <GlitchText
                text={incoming.typed}
                corrupted={corruptedOf(incoming.nodeId)}
              />
              <span className="typing__caret" aria-hidden="true" />
            </div>
          </div>
        ) : null}

        {showTyping ? <TypingIndicator locale={locale} /> : null}

        <div ref={bottomRef} />
      </div>
    </main>
  );
}
