import { memo } from "react";
import { speakerLabel } from "../game/engine";
import type { HistoryEntry, Locale } from "../game/types";
import { GlitchText } from "./GlitchText";

type Props = {
  entry: HistoryEntry;
  locale: Locale;
  corrupted?: boolean;
  memory?: boolean;
  recovered?: boolean;
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function MessageBase({ entry, locale, corrupted, memory, recovered }: Props) {
  const speaker =
    entry.speaker === "mira" && !entry.text
      ? locale.ui.unknownSpeaker
      : speakerLabel(entry.speaker);
  const cls = `msg msg--${entry.speaker}${
    corrupted ? " msg--corrupted" : ""
  }${memory ? " msg--memory" : ""}${recovered ? " msg--recovered" : ""}`;
  return (
    <div className={cls}>
      <div className="msg__head">
        <span className="msg__speaker">{speaker}</span>
        <span className="msg__time">{formatTime(entry.timestamp)}</span>
      </div>
      <div className="msg__body">
        <GlitchText text={entry.text} corrupted={corrupted} />
      </div>
    </div>
  );
}

export const Message = memo(MessageBase);
