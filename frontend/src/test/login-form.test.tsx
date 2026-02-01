import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../components/auth/LoginForm";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { authApi } from "../api/auth";

// Mock the auth API
vi.mock("../api/auth", () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

/**
 * Test wrapper that provides necessary context providers
 */
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <NotificationProvider>
      <AuthProvider>{ui}</AuthProvider>
    </NotificationProvider>,
  );
};

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getCurrentUser to return null (not authenticated)
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(
      new Error("Not authenticated"),
    );
  });

  describe("Rendering", () => {
    it("should render email and password fields", () => {
      renderWithProviders(<LoginForm />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("should render submit button with correct text", () => {
      renderWithProviders(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: /log in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it("should have proper input types", () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have proper autocomplete attributes", () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    });
  });

  describe("Form Validation", () => {
    it("should display error when email is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      // Focus and blur without entering value
      await user.click(emailInput);
      await user.tab();

      // Try to submit
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("should display error when email is invalid", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it("should display error when password is too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(passwordInput, "12345");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i),
        ).toBeInTheDocument();
      });
    });

    it("should display multiple validation errors simultaneously", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "invalid");
      await user.type(passwordInput, "123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        expect(
          screen.getByText(/password must be at least 6 characters/i),
        ).toBeInTheDocument();
      });
    });

    it("should clear validation errors when valid input is provided", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      // Trigger validation error
      await user.type(emailInput, "invalid");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });

      // Fix the error
      await user.clear(emailInput);
      await user.type(emailInput, "valid@example.com");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid email address/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call login function with correct credentials on valid submission", async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
      };

      vi.mocked(authApi.login).mockResolvedValue(mockUser);

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authApi.login).mockReturnValue(loginPromise as any);

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise
      resolveLogin!({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText(/logging in\.\.\./i)).not.toBeInTheDocument();
      });
    });

    it("should disable form inputs during submission", async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authApi.login).mockReturnValue(loginPromise as any);

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Check that inputs are disabled
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise
      resolveLogin!({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });

      // Wait for inputs to be enabled again
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
      });
    });

    it("should call onSuccess callback after successful login", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user" as const,
      };

      vi.mocked(authApi.login).mockResolvedValue(mockUser);

      renderWithProviders(<LoginForm onSuccess={onSuccess} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should not call onSuccess callback when login fails", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      vi.mocked(authApi.login).mockRejectedValue(
        new Error("Invalid credentials"),
      );

      renderWithProviders(<LoginForm onSuccess={onSuccess} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled();
      });

      // Wait a bit to ensure onSuccess is not called
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should display error notification when login fails", async () => {
      const user = userEvent.setup();

      vi.mocked(authApi.login).mockRejectedValue({
        response: {
          data: {
            message: "Invalid email or password",
          },
        },
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i),
        ).toBeInTheDocument();
      });
    });

    it("should display generic error message when error has no response", async () => {
      const user = userEvent.setup();

      vi.mocked(authApi.login).mockRejectedValue(new Error("Network error"));

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it("should re-enable form after error", async () => {
      const user = userEvent.setup();

      vi.mocked(authApi.login).mockRejectedValue(
        new Error("Invalid credentials"),
      );

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled();
      });

      // Form should be enabled again
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for invalid fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "invalid");
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
        expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
      });
    });

    it("should have proper ARIA busy attribute during submission", async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authApi.login).mockReturnValue(loginPromise as any);

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute("aria-busy", "true");
      });

      resolveLogin!({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });
    });

    it("should have proper role attributes for error messages", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /log in/i });

      await user.type(emailInput, "invalid");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email address/i);
        expect(errorMessage).toHaveAttribute("role", "alert");
      });
    });
  });
});
