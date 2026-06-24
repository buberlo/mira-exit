import { useEffect, useRef } from "react";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__head">
          <span className="dialog__title">{title}</span>
        </div>
        <div className="dialog__body">
          <p className="dialog__desc">{message}</p>
        </div>
        <div className="dialog__foot">
          {cancelLabel ? (
            <button
              className="dialog__btn"
              type="button"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            ref={confirmRef}
            className={`dialog__btn${destructive ? " dialog__btn--danger" : " dialog__btn--primary"}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
