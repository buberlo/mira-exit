import { memo } from "react";

type Props = {
  text: string;
  corrupted?: boolean;
};

function highlightCapitals(text: string): React.ReactNode {
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (/^\s+$/.test(part)) return part;
    if (part.length > 1 && part === part.toUpperCase() && /[A-Z]/.test(part)) {
      return (
        <span key={i} className="glitch-cap">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function GlitchTextBase({ text, corrupted }: Props) {
  if (corrupted) {
    return <>{highlightCapitals(text)}</>;
  }
  return <>{text}</>;
}

export const GlitchText = memo(GlitchTextBase);
