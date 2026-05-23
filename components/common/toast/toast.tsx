import useGlobalStore from "@/store/global";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { FC, useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
}

/**
 * Owner-style toast — soft pastel container with a tinted icon tile,
 * matched typography, and a hairline border. Replaces the legacy
 * solid-blue / solid-red toast that conflicted with the new design.
 */
export const Toast: FC<ToastProps> = ({ message, type }) => {
  const { setToastData } = useGlobalStore();

  const tone =
    type === "success"
      ? {
          surface:
            "border-owner-success-border bg-owner-success-bg text-owner-success-text",
          iconWrap: "bg-white text-owner-success-text",
          Icon: CheckCircle2,
          srLabel: "Success",
        }
      : type === "error"
      ? {
          surface: "border-owner-danger-bg bg-owner-danger-bg text-owner-danger-text",
          iconWrap: "bg-white text-owner-danger-text",
          Icon: XCircle,
          srLabel: "Error",
        }
      : {
          surface: "border-owner-warning-bg bg-owner-warning-bg text-owner-warning-text",
          iconWrap: "bg-white text-owner-warning-text",
          Icon: Info,
          srLabel: "Notice",
        };

  useEffect(() => {
    const timer = setTimeout(() => setToastData(null), 3000);
    return () => clearTimeout(timer);
  }, [setToastData]);

  const { Icon } = tone;

  return createPortal(
    <div
      className={`fixed bottom-4 right-4 z-[1000] flex w-full max-w-sm items-center gap-3 rounded-owner-md border p-3.5 shadow-owner-md ${tone.surface}`}
      role="alert"
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-owner-sm ${tone.iconWrap}`}
      >
        <Icon size={18} strokeWidth={2.2} />
        <span className="sr-only">{tone.srLabel}</span>
      </div>
      <div className="flex-1 text-[14px] font-medium leading-snug">{message}</div>
      <button
        type="button"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-owner-sm transition hover:bg-black/5"
        aria-label="Close"
        onClick={() => setToastData(null)}
      >
        <X size={14} strokeWidth={2.2} />
      </button>
    </div>,
    document.body
  );
};

export default Toast;
