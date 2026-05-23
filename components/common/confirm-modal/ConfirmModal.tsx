import { Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";

type ConfirmTone = "default" | "danger" | "warning";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

const toneClasses: Record<ConfirmTone, string> = {
  default:
    "bg-[var(--owner-blue-500)] text-[var(--owner-bg)] hover:bg-[var(--owner-blue-600)]",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const iconClasses: Record<ConfirmTone, string> = {
  default: "bg-[var(--owner-blue-50,#eef4ff)] text-[var(--owner-blue-500)]",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const [pending, setPending] = useState(false);
  const busy = isLoading || pending;

  const handleConfirm = useCallback(async () => {
    if (busy) return;
    setPending(true);
    try {
      await onConfirm();
      onCancel();
    } finally {
      setPending(false);
    }
  }, [busy, onCancel, onConfirm]);

  useEffect(() => {
    if (!isOpen) {
      setPending(false);
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key === "Enter" && !event.defaultPrevented) {
        event.preventDefault();
        void handleConfirm();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [handleConfirm, isOpen, onCancel]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] grid min-h-[100dvh] place-items-center overflow-y-auto overscroll-contain bg-black/55 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
      role="presentation"
    >
      <div
        className="max-h-[calc(100dvh-32px)] w-full max-w-md overflow-y-auto rounded-owner-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-5 font-owner text-[var(--owner-fg-1)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClasses[tone]}`}
          >
            <TriangleAlertIcon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-modal-title" className="text-base font-semibold">
                {title}
              </h2>
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[var(--owner-fg-3)] transition hover:bg-[var(--owner-bg-subtle)] hover:text-[var(--owner-fg-1)] disabled:opacity-50"
                aria-label="Cancel"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="mt-2 text-sm leading-6 text-[var(--owner-fg-3)]">
              {description}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-[var(--owner-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--owner-fg-1)] transition hover:bg-[var(--owner-bg-subtle)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className={`inline-flex min-w-[112px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[tone]}`}
          >
            {busy ? <Loader2Icon size={15} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
