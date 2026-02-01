import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../components/common/Modal";

describe("Modal", () => {
  describe("Basic Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const modal = screen.queryByTestId("modal");
      expect(modal).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const modal = screen.getByTestId("modal");
      expect(modal).toBeInTheDocument();
    });

    it("should render title correctly", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal Title">
          <p>Modal content</p>
        </Modal>,
      );

      const title = screen.getByTestId("modal-title");
      expect(title).toHaveTextContent("Test Modal Title");
    });

    it("should render children content", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>This is the modal content</p>
        </Modal>,
      );

      const body = screen.getByTestId("modal-body");
      expect(body).toHaveTextContent("This is the modal content");
    });

    it("should have proper dialog role", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should render modal panel", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toBeInTheDocument();
    });

    it("should render backdrop", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const backdrop = screen.getByTestId("modal-backdrop");
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe("Close Button", () => {
    it("should show close button by default", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const closeButton = screen.getByTestId("modal-close-button");
      expect(closeButton).toBeInTheDocument();
    });

    it("should hide close button when showCloseButton is false", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          showCloseButton={false}
        >
          <p>Modal content</p>
        </Modal>,
      );

      const closeButton = screen.queryByTestId("modal-close-button");
      expect(closeButton).not.toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const closeButton = screen.getByTestId("modal-close-button");
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("should have proper aria-label on close button", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toBeInTheDocument();
    });

    it("should have X icon in close button", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const closeButton = screen.getByTestId("modal-close-button");
      const svg = closeButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("should not render footer by default", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const footer = screen.queryByTestId("modal-footer");
      expect(footer).not.toBeInTheDocument();
    });

    it("should render footer when provided", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          footer={
            <>
              <button>Cancel</button>
              <button>Confirm</button>
            </>
          }
        >
          <p>Modal content</p>
        </Modal>,
      );

      const footer = screen.getByTestId("modal-footer");
      expect(footer).toBeInTheDocument();
    });

    it("should render footer content correctly", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          footer={
            <>
              <button>Cancel</button>
              <button>Confirm</button>
            </>
          }
        >
          <p>Modal content</p>
        </Modal>,
      );

      const footer = screen.getByTestId("modal-footer");
      expect(footer).toHaveTextContent("Cancel");
      expect(footer).toHaveTextContent("Confirm");
    });

    it("should have proper footer styling classes", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          footer={<button>OK</button>}
        >
          <p>Modal content</p>
        </Modal>,
      );

      const footer = screen.getByTestId("modal-footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
      expect(footer).toHaveClass("justify-end");
      expect(footer).toHaveClass("gap-3");
    });
  });

  describe("Size Variants", () => {
    it("should render medium size by default", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-md");
    });

    it("should render small size modal", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="sm">
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-sm");
    });

    it("should render medium size modal", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="md">
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-md");
    });

    it("should render large size modal", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="lg">
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-lg");
    });

    it("should render extra large size modal", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" size="xl">
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-xl");
    });
  });

  describe("Backdrop Click", () => {
    it("should close on backdrop click by default", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const backdrop = screen.getByTestId("modal-backdrop");
      await user.click(backdrop);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("should not close on backdrop click when closeOnBackdropClick is false", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Test Modal"
          closeOnBackdropClick={false}
        >
          <p>Modal content</p>
        </Modal>,
      );

      const backdrop = screen.getByTestId("modal-backdrop");
      await user.click(backdrop);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe("Escape Key", () => {
    it("should close on escape key by default", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it("should not close on escape key when closeOnEscape is false", async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Test Modal"
          closeOnEscape={false}
        >
          <p>Modal content</p>
        </Modal>,
      );

      await user.keyboard("{Escape}");

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className to modal panel", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          className="custom-modal-class"
        >
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("custom-modal-class");
    });

    it("should preserve default classes when custom className is added", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
          className="custom-class"
        >
          <p>Modal content</p>
        </Modal>,
      );

      const panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("custom-class");
      expect(panel).toHaveClass("w-full");
      expect(panel).toHaveClass("max-w-md");
      expect(panel).toHaveClass("rounded-lg");
      expect(panel).toHaveClass("bg-white");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should have aria-hidden on backdrop", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const backdrop = screen.getByTestId("modal-backdrop");
      expect(backdrop).toHaveAttribute("aria-hidden", "true");
    });

    it("should have aria-hidden on close button icon", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const closeButton = screen.getByTestId("modal-close-button");
      const svg = closeButton.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Integration", () => {
    it("should work with complex footer content", () => {
      const handleCancel = vi.fn();
      const handleConfirm = vi.fn();

      render(
        <Modal
          isOpen={true}
          onClose={handleCancel}
          title="Confirm Action"
          footer={
            <>
              <button onClick={handleCancel} data-testid="cancel-btn">
                Cancel
              </button>
              <button onClick={handleConfirm} data-testid="confirm-btn">
                Confirm
              </button>
            </>
          }
        >
          <p>Are you sure?</p>
        </Modal>,
      );

      const footer = screen.getByTestId("modal-footer");
      expect(footer).toBeInTheDocument();

      const cancelBtn = screen.getByTestId("cancel-btn");
      const confirmBtn = screen.getByTestId("confirm-btn");

      expect(cancelBtn).toBeInTheDocument();
      expect(confirmBtn).toBeInTheDocument();
    });

    it("should handle multiple modals with different sizes", () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Small Modal" size="sm">
          <p>Small content</p>
        </Modal>,
      );

      let panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-sm");

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} title="Large Modal" size="lg">
          <p>Large content</p>
        </Modal>,
      );

      panel = screen.getByTestId("modal-panel");
      expect(panel).toHaveClass("max-w-lg");
    });

    it("should handle modal state changes", () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      let modal = screen.queryByTestId("modal");
      expect(modal).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      modal = screen.getByTestId("modal");
      expect(modal).toBeInTheDocument();
    });
  });
});
