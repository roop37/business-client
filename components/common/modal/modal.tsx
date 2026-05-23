import { cn } from "@/lib/utils";
import { fadeIn } from "@/utils/animations";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: "xs" | "sm" | "md" | "ml" | "lg" | "xl" | "dxl";
  title: string;
  comments?: string;
  className?: string;
  isHighIndex?: boolean;
}

const ReusableModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  width = "md",
  title,
  comments,
  className = "rounded-owner-lg",
  isHighIndex = false,
}) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if ((event.target as Element).classList.contains("modal-overlay")) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onClose]);

  const widthClasses = {
    xs: "w-11/12 lg:w-1/5",
    sm: "w-11/12 lg:w-1/4 ",
    md: "w-11/12 lg:w-1/3 ",
    ml: "w-11/12 lg:w-1/2 ",
    lg: "w-11/12 lg:w-3/4 ",
    xl: "w-11/12 lg:w-[95vw] ",
    dxl: "w-11/12 lg:w-11/12",
  };

  if (!isOpen) return;

  const zIndexClass = isHighIndex ? "z-[1000]" : "z-50";
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`modal-overlay fixed inset-0 flex items-center justify-center bg-owner-fg-1/45 backdrop-blur-[1px] ${zIndexClass}`}
        >
          <motion.div
            variants={fadeIn("up", "tween", 0, 0.3)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={cn(
              `bg-owner-bg border border-owner-border shadow-owner-dropdown ${widthClasses[width]} max-h-[95vh] overflow-y-auto z-10`,
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 font-owner text-owner-fg-1">
              <div className="flex items-start justify-between rounded-t pb-2">
                <div className="min-w-0">
                  <h2 className="owner-h2">{title}</h2>
                  {comments ? (
                    <p className="mt-1 text-[13px] text-owner-fg-3">{comments}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="ms-3 grid h-8 w-8 shrink-0 place-items-center rounded-owner-sm text-owner-fg-3 transition hover:bg-owner-bg-subtle hover:text-owner-fg-1"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg
                    className="h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="mt-3">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ReusableModal;
