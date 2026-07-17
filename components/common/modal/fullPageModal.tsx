import { fadeIn } from "@/utils/animations";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import CButton from "../button/button";
import { ButtonType } from "../button/interface";

interface FullPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  comments?: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  hasTopQuickActions?: boolean;
  isSave?: boolean;
  onEscClose?: boolean;
  buttonTitle?: string;
}

const FullPageModal: React.FC<FullPageModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  comments,
  hasTopQuickActions = false,
  isSave = false,
  buttonTitle = "Save",
  onEscClose = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Add keyboard event listener for Escape key (now controlled by onEscClose prop)
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && onEscClose) {
        onClose();
      }
    };

    if (isOpen && onEscClose) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, onEscClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--owner-fg-1)]/55"
        >
          <motion.div
            variants={fadeIn("up", "tween", 0, 0.3)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="h-full max-h-full w-full overflow-auto bg-[var(--owner-bg-sidebar)] text-[var(--owner-fg-1)]"
          >
            <div className="flex h-full flex-col">
              <div className="z-20 flex items-center justify-between border-b border-[var(--owner-border)] bg-[var(--owner-bg)]/95 px-6 py-4 shadow-sm">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-[var(--owner-fg-1)]">{title}</h2>
                  {subtitle ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--owner-fg-3)]">{subtitle}</p>
                  ) : null}
                </div>
                {isSave ? (
                  <CButton
                    className="w-fit"
                    variant={ButtonType.Primary}
                    onClick={onClose}
                  >
                    {buttonTitle}
                  </CButton>
                ) : (
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--owner-border)] bg-white text-[var(--owner-fg-3)] hover:border-[var(--owner-blue-500)] hover:text-[var(--owner-fg-1)]"
                    onClick={onClose}
                  >
                    <svg
                      className="w-3 h-3"
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
                )}
              </div>

              <div
                className={`flex-grow overflow-auto overscroll-contain px-4 md:px-6 ${
                  hasTopQuickActions ? "pb-4" : "py-5"
                }`}
              >
                {comments && <p className="text-gray-700 mb-4">{comments}</p>}
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FullPageModal;
