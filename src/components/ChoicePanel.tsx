import { useEffect, useRef, useState } from "react";
import type { Choice, Locale, StoryInput } from "../game/types";
import { resolveChoiceLabel } from "../game/engine";
import type { GameState } from "../game/types";

type Props = {
  locale: Locale;
  state: GameState;
  choices: Choice[];
  disabled: boolean;
  input?: StoryInput;
  onSelect: (choiceId: string) => void;
  onSubmitName: (name: string) => void;
};

function ChoicePanelBase({
  locale,
  state,
  choices,
  disabled,
  input,
  onSelect,
  onSubmitName,
}: Props) {
  const [nameValue, setNameValue] = useState("");
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input && fieldRef.current) {
      fieldRef.current.focus();
    }
  }, [input]);

  useEffect(() => {
    if (input) return;
    if (disabled || choices.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= choices.length) {
        e.preventDefault();
        onSelect(choices[n - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, disabled, input, onSelect]);

  if (input) {
    const submit = () => {
      onSubmitName(nameValue);
    };
    return (
      <div className="choices" role="group" aria-label={locale.ui.settings.title}>
        <div className="choices__inner">
          <div className="nameinput">
            <input
              ref={fieldRef}
              className="nameinput__field"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={input.maxLength ?? 24}
              placeholder={input.placeholder ?? "MIRA"}
              value={nameValue}
              aria-label={input.placeholder ?? "MIRA"}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <button
              className="nameinput__send"
              type="button"
              disabled={nameValue.trim().length === 0}
              onClick={submit}
            >
              Send
            </button>
          </div>
          <p className="choices__hint">{locale.ui.footerHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="choices" role="group" aria-label={locale.ui.choicesLocked}>
      <div className="choices__inner">
        {choices.map((choice, i) => (
          <button
            key={choice.id}
            className="choice"
            type="button"
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            aria-keyshortcuts={String(i + 1)}
          >
            <span className="choice__key" aria-hidden="true">
              {i + 1}
            </span>
            <span className="choice__label">
              {resolveChoiceLabel(choice, state)}
            </span>
          </button>
        ))}
        {choices.length > 0 && !disabled && (
          <p className="choices__hint">{locale.ui.footerHint}</p>
        )}
      </div>
    </div>
  );
}

export const ChoicePanel = ChoicePanelBase;
