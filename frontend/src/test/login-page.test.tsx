import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { NotificationProvider } from "../contexts/NotificationContext";

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <Login />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>,
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the login page with Layout wrapper", () => {
      renderLoginPage();

      // Check for page title (using role to be more specific)
      expect(
        screen.getByRole("heading", { name: /login/i }),
      ).toBeInTheDocument();
    });

    it("should render LoginForm component", () => {
      renderLoginPage();

      // Check for form fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /log in/i }),
      ).toBeInTheDocument();
    });

    it("should render link to signup page", () => {
      renderLoginPage();

      const signupLink = screen.getByRole("link", { name: /sign up here/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/signup");
    });

    it("should have proper styling with card layout", () => {
      renderLoginPage();

      // Check for the heading with centered class
      const heading = screen.getByRole("heading", { name: /login/i });
      expect(heading).toHaveClass("text-center");
    });
  });

  describe("Navigation", () => {
    it("should display 'Don't have an account?' text", () => {
      renderLoginPage();

      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    });

    it("should have centered layout", () => {
      renderLoginPage();

      const heading = screen.getByRole("heading", { name: /login/i });
      expect(heading).toHaveClass("text-center");
    });
  });

  describe("Integration with Layout", () => {
    it("should render Header component", () => {
      renderLoginPage();

      // Header should contain navigation
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render Footer component", () => {
      renderLoginPage();

      // Footer should be present
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
  });
});
