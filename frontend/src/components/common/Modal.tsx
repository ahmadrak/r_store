import React from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const shouldUseStatic = !closeOnEscape || !closeOnBackdropClick;

  const handleDialogClose = () => {
    if (closeOnEscape && closeOnBackdropClick) {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  React.useEffect(() => {
    if (!closeOnEscape || !shouldUseStatic) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, shouldUseStatic]);

  return (
    <Transition show={isOpen}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={shouldUseStatic ? () => {} : handleDialogClose}
        static={shouldUseStatic}
        data-testid="modal"
      >
        {/* Backdrop */}
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
            data-testid="modal-backdrop"
            onClick={shouldUseStatic ? handleBackdropClick : undefined}
          />
        </TransitionChild>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`
                  w-full ${sizeClasses[size]}
                  transform overflow-hidden rounded-lg bg-white
                  text-left align-middle shadow-xl transition-all
                  ${className}
                `.trim()}
                data-testid="modal-panel"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                    data-testid="modal-title"
                  >
                    {title}
                  </DialogTitle>

                  {/* Close button */}
                  {showCloseButton && (
                    <button
                      type="button"
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                      aria-label="Close modal"
                      data-testid="modal-close-button"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="px-6 py-4" data-testid="modal-body">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div
                    className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4"
                    data-testid="modal-footer"
                  >
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
