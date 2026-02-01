import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import {
  NotificationProvider,
  useNotification,
} from "../contexts/NotificationContext";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => {
  const mockToast = vi.fn();
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();

  return {
    default: Object.assign(mockToast, {
      success: mockToastSuccess,
      error: mockToastError,
    }),
    Toaster: () => null,
  };
});

// Test component that uses the notification context
const TestComponent = () => {
  const { showSuccess, showError, showInfo } = useNotification();

  return (
    <div>
      <button onClick={() => showSuccess("Success message")}>
        Show Success
      </button>
      <button onClick={() => showError("Error message")}>Show Error</button>
      <button onClick={() => showInfo("Info message")}>Show Info</button>
    </div>
  );
};

describe("NotificationContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error when useNotification is used outside provider", () => {
    // Suppress console.error for this test
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNotification must be used within NotificationProvider");

    consoleError.mockRestore();
  });

  it("should provide notification functions through context", () => {
    const { container } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    expect(container).toBeTruthy();
    expect(screen.getByText("Show Success")).toBeInTheDocument();
    expect(screen.getByText("Show Error")).toBeInTheDocument();
    expect(screen.getByText("Show Info")).toBeInTheDocument();
  });

  it("should call toast.success with correct parameters when showSuccess is called", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    const successButton = screen.getByText("Show Success");
    await user.click(successButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Success message", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#10b981",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10b981",
        },
      });
    });
  });

  it("should call toast.error with correct parameters when showError is called", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    const errorButton = screen.getByText("Show Error");
    await user.click(errorButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error message", {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#ef4444",
        },
      });
    });
  });

  it("should call toast with correct parameters when showInfo is called", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    const infoButton = screen.getByText("Show Info");
    await user.click(infoButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Info message", {
        duration: 4000,
        position: "top-right",
        icon: "ℹ️",
        style: {
          background: "#3b82f6",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });
    });
  });

  it("should allow multiple notifications to be shown", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    const successButton = screen.getByText("Show Success");
    const errorButton = screen.getByText("Show Error");

    await user.click(successButton);
    await user.click(errorButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });
});
