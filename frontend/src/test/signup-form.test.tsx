import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "../components/auth/SignupForm";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { authApi } from "../api/auth";

// Mock the auth API
vi.mock("../api/auth", () => ({
  authApi: {
    signup: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn(),
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

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getCurrentUser to return null (not authenticated)
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(
      new Error("Not authenticated"),
    );
  });

  describe("Rendering", () => {
    it("should render name, email and password fields", () => {
      renderWithProviders(<SignupForm />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("should render submit button with correct text", () => {
      renderWithProviders(<SignupForm />);

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it("should have proper input types", () => {
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(nameInput).toHaveAttribute("type", "text");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have proper autocomplete attributes", () => {
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(nameInput).toHaveAttribute("autocomplete", "name");
      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
    });
  });

  describe("Form Validation", () => {
    it("should display error when name is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      // Focus and blur without entering value
      await user.click(nameInput);
      await user.tab();

      // Try to submit
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it("should display error when name contains invalid characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/name can only contain letters/i),
        ).toBeInTheDocument();
      });
    });

    it("should accept valid names with spaces, hyphens, and apostrophes", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "Mary-Jane O'Connor");
      await user.type(emailInput, "mary@example.com");
      await user.type(passwordInput, "password123");

      // Should not show name validation error
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/name can only contain letters/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should display error when email is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

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
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it("should display error when password is too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

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
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John123");
      await user.type(emailInput, "invalid");
      await user.type(passwordInput, "123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/name can only contain letters/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        expect(
          screen.getByText(/password must be at least 6 characters/i),
        ).toBeInTheDocument();
      });
    });

    it("should clear validation errors when valid input is provided", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

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
    it("should call signup function with correct data on valid submission", async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user" as const,
      };

      vi.mocked(authApi.signup).mockResolvedValue(mockUser);

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.signup).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      let resolveSignup: (value: any) => void;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });

      vi.mocked(authApi.signup).mockReturnValue(signupPromise as any);

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise
      resolveSignup!({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      });

      // Wait for loading to finish
      await waitFor(() => {
        expect(
          screen.queryByText(/creating account\.\.\./i),
        ).not.toBeInTheDocument();
      });
    });

    it("should disable form inputs during submission", async () => {
      const user = userEvent.setup();
      let resolveSignup: (value: any) => void;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });

      vi.mocked(authApi.signup).mockReturnValue(signupPromise as any);

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Check that inputs are disabled
      await waitFor(() => {
        expect(nameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise
      resolveSignup!({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      });

      // Wait for inputs to be enabled again
      await waitFor(() => {
        expect(nameInput).not.toBeDisabled();
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
      });
    });

    it("should call onSuccess callback after successful signup", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user" as const,
      };

      vi.mocked(authApi.signup).mockResolvedValue(mockUser);

      renderWithProviders(<SignupForm onSuccess={onSuccess} />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should not call onSuccess callback when signup fails", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      vi.mocked(authApi.signup).mockRejectedValue(
        new Error("Email already exists"),
      );

      renderWithProviders(<SignupForm onSuccess={onSuccess} />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.signup).toHaveBeenCalled();
      });

      // Wait a bit to ensure onSuccess is not called
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should display error notification when signup fails", async () => {
      const user = userEvent.setup();

      vi.mocked(authApi.signup).mockRejectedValue({
        response: {
          data: {
            message: "Email already exists",
          },
        },
      });

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.queryAllByText(/email already exists/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should display generic error message when error has no response", async () => {
      const user = userEvent.setup();

      vi.mocked(authApi.signup).mockRejectedValue(new Error("Network error"));

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it("should re-enable form after error", async () => {
      const user = userEvent.setup();

      vi.mocked(authApi.signup).mockRejectedValue(
        new Error("Email already exists"),
      );

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.signup).toHaveBeenCalled();
      });

      // Form should be enabled again
      await waitFor(() => {
        expect(nameInput).not.toBeDisabled();
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for invalid fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John123");
      await user.type(emailInput, "invalid");
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
        expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
        expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
      });
    });

    it("should have proper ARIA busy attribute during submission", async () => {
      const user = userEvent.setup();
      let resolveSignup: (value: any) => void;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });

      vi.mocked(authApi.signup).mockReturnValue(signupPromise as any);

      renderWithProviders(<SignupForm />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute("aria-busy", "true");
      });

      resolveSignup!({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      });
    });

    it("should have proper role attributes for error messages", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(emailInput, "invalid");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email address/i);
        expect(errorMessage).toHaveAttribute("role", "alert");
      });
    });
  });
});
