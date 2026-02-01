import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Signup from "../pages/Signup";
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

const renderSignupPage = () => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <Signup />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>,
  );
};

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the signup page with Layout wrapper", () => {
      renderSignupPage();

      // Check for page title (using role to be more specific)
      expect(
        screen.getByRole("heading", { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    it("should render SignupForm component", () => {
      renderSignupPage();

      // Check for form fields
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i }),
      ).toBeInTheDocument();
    });

    it("should render link to login page", () => {
      renderSignupPage();

      const loginLink = screen.getByRole("link", { name: /login here/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should have proper styling with card layout", () => {
      renderSignupPage();

      // Check for the heading with centered class
      const heading = screen.getByRole("heading", { name: /sign up/i });
      expect(heading).toHaveClass("text-center");
    });
  });

  describe("Navigation", () => {
    it("should display 'Already have an account?' text", () => {
      renderSignupPage();

      expect(
        screen.getByText(/already have an account\?/i),
      ).toBeInTheDocument();
    });

    it("should have centered layout", () => {
      renderSignupPage();

      const heading = screen.getByRole("heading", { name: /sign up/i });
      expect(heading).toHaveClass("text-center");
    });
  });

  describe("Integration with Layout", () => {
    it("should render Header component", () => {
      renderSignupPage();

      // Header should contain navigation
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render Footer component", () => {
      renderSignupPage();

      // Footer should be present
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
  });
});
