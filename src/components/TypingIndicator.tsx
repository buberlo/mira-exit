import { memo } from "react";
import type { Locale } from "../game/types";

type Props = {
  locale: Locale;
};

function TypingIndicatorBase({ locale }: Props) {
  return (
    <div className="typing" aria-label={locale.ui.typing} role="status">
      <span className="typing__dot" />
      <span className="typing__dot" />
      <span className="typing__dot" />
      <span style={{ marginLeft: 4 }}>{locale.ui.typing}</span>
    </div>
  );
}

export const TypingIndicator = memo(TypingIndicatorBase);
