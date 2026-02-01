import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";
import { CartContext, type CartContextType } from "../contexts/CartContext";
import type { User } from "../types";

/**
 * Test Suite: Header Component
 *
 * Tests the Header component's rendering and behavior based on authentication state.
 * Validates Requirements 12.7, 12.8, 12.9, 3.2, 11.2
 */

// Mock user data
const mockUser: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "user",
};

const mockAdminUser: User = {
  id: 2,
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
};

// Helper function to render Header with auth and cart contexts
const renderHeader = (
  authContextValue: Partial<AuthContextType>,
  cartContextValue?: Partial<CartContextType>,
) => {
  const defaultAuthContext: AuthContextType = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    ...authContextValue,
  };

  const defaultCartContext: CartContextType = {
    items: [],
    itemCount: 0,
    totalPrice: 0,
    isLoading: false,
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    refreshCart: vi.fn(),
    ...cartContextValue,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthContext}>
        <CartContext.Provider value={defaultCartContext}>
          <Header />
        </CartContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>,
  );
};

describe("Header Component", () => {
  describe("Guest User (Not Authenticated)", () => {
    it("should render logo and site title", () => {
      renderHeader({ isAuthenticated: false });

      const logo = screen.getByText("E-Shop");
      expect(logo).toBeInTheDocument();
      expect(logo.tagName).toBe("A");
      expect(logo).toHaveAttribute("href", "/");
    });

    it("should render Home link", () => {
      renderHeader({ isAuthenticated: false });

      const homeLink = screen.getByRole("link", { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should render Login and Sign Up links", () => {
      renderHeader({ isAuthenticated: false });

      const loginLink = screen.getByRole("link", { name: /login/i });
      const signupLink = screen.getByRole("link", { name: /sign up/i });

      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/signup");
    });

    it("should NOT render Cart link for guest users", () => {
      renderHeader({ isAuthenticated: false });

      const cartLink = screen.queryByRole("link", { name: /cart/i });
      expect(cartLink).not.toBeInTheDocument();
    });

    it("should NOT render Orders link for guest users", () => {
      renderHeader({ isAuthenticated: false });

      const ordersLink = screen.queryByRole("link", { name: /orders/i });
      expect(ordersLink).not.toBeInTheDocument();
    });

    it("should NOT render admin links for guest users", () => {
      renderHeader({ isAuthenticated: false });

      expect(
        screen.queryByRole("link", { name: /manage products/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /manage categories/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /manage orders/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Authenticated Regular User", () => {
    it("should render welcome message with user name", () => {
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });

    it("should render Cart link with badge", () => {
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      const cartLinks = screen.getAllByRole("link", { name: /cart/i });
      expect(cartLinks.length).toBeGreaterThan(0);
      expect(cartLinks[0]).toHaveAttribute("href", "/cart");
    });

    it("should render Orders link", () => {
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      const ordersLinks = screen.getAllByRole("link", { name: /orders/i });
      expect(ordersLinks.length).toBeGreaterThan(0);
      expect(ordersLinks[0]).toHaveAttribute("href", "/orders");
    });

    it("should render Logout button", () => {
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it("should NOT render Login and Sign Up links", () => {
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      // In desktop view, Login/Signup should not be present
      const loginLinks = screen.queryAllByRole("link", { name: /^login$/i });
      const signupLinks = screen.queryAllByRole("link", { name: /sign up/i });

      // These should not be in the desktop menu
      expect(loginLinks.length).toBe(0);
      expect(signupLinks.length).toBe(0);
    });

    it("should NOT render admin links for regular users", () => {
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      expect(
        screen.queryByRole("link", { name: /manage products/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /manage categories/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /manage orders/i }),
      ).not.toBeInTheDocument();
    });

    it("should call logout function when Logout button is clicked", async () => {
      const user = userEvent.setup();
      const mockLogout = vi.fn().mockResolvedValue(undefined);

      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
        logout: mockLogout,
      });

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Authenticated Admin User", () => {
    it("should render all admin navigation links", () => {
      renderHeader({
        user: mockAdminUser,
        isAuthenticated: true,
        isAdmin: true,
      });

      const manageProductsLink = screen.getByRole("link", {
        name: /manage products/i,
      });
      const manageCategoriesLink = screen.getByRole("link", {
        name: /manage categories/i,
      });
      const manageOrdersLink = screen.getByRole("link", {
        name: /manage orders/i,
      });

      expect(manageProductsLink).toBeInTheDocument();
      expect(manageProductsLink).toHaveAttribute("href", "/admin/products");

      expect(manageCategoriesLink).toBeInTheDocument();
      expect(manageCategoriesLink).toHaveAttribute("href", "/admin/categories");

      expect(manageOrdersLink).toBeInTheDocument();
      expect(manageOrdersLink).toHaveAttribute("href", "/admin/orders");
    });

    it("should render regular user links in addition to admin links", () => {
      renderHeader({
        user: mockAdminUser,
        isAuthenticated: true,
        isAdmin: true,
      });

      // Admin should also have access to regular user features
      expect(
        screen.getAllByRole("link", { name: /cart/i }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole("link", { name: /orders/i }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getByRole("button", { name: /logout/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Mobile Menu", () => {
    it("should render mobile menu toggle button", () => {
      renderHeader({ isAuthenticated: false });

      const toggleButton = screen.getByRole("button", {
        name: /toggle mobile menu/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it("should toggle mobile menu when button is clicked", async () => {
      const user = userEvent.setup();
      renderHeader({ isAuthenticated: false });

      const toggleButton = screen.getByRole("button", {
        name: /toggle mobile menu/i,
      });

      // Mobile menu should not be visible initially
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");

      // Click to open
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");

      // Click to close
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });

    it("should close mobile menu when a link is clicked", async () => {
      const user = userEvent.setup();
      renderHeader({
        user: mockUser,
        isAuthenticated: true,
        isAdmin: false,
      });

      const toggleButton = screen.getByRole("button", {
        name: /toggle mobile menu/i,
      });

      // Open mobile menu
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");

      // Click a link in the mobile menu
      const homeLinks = screen.getAllByRole("link", { name: /home/i });
      // The second one should be in the mobile menu
      await user.click(homeLinks[homeLinks.length - 1]);

      // Menu should close
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("should display admin links in mobile menu for admin users", async () => {
      const user = userEvent.setup();
      renderHeader({
        user: mockAdminUser,
        isAuthenticated: true,
        isAdmin: true,
      });

      const toggleButton = screen.getByRole("button", {
        name: /toggle mobile menu/i,
      });

      // Open mobile menu
      await user.click(toggleButton);

      // Check for admin section header (exact match to avoid matching "Admin User")
      expect(screen.getByText("Admin")).toBeInTheDocument();

      // Check for admin links
      expect(
        screen.getAllByRole("link", { name: /manage products/i }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole("link", { name: /manage categories/i }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole("link", { name: /manage orders/i }).length,
      ).toBeGreaterThan(0);
    });
  });

  describe("Cart Badge", () => {
    it("should not display cart badge when item count is 0", () => {
      renderHeader(
        {
          user: mockUser,
          isAuthenticated: true,
          isAdmin: false,
        },
        {
          itemCount: 0,
        },
      );

      // Cart badge should not be visible when count is 0
      const badges = screen.queryAllByText("0");
      expect(badges.length).toBe(0);
    });

    it("should display cart badge with item count when count > 0", () => {
      renderHeader(
        {
          user: mockUser,
          isAuthenticated: true,
          isAdmin: false,
        },
        {
          itemCount: 3,
        },
      );

      // Cart badge should be visible with count
      const badge = screen.getByText("3");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-red-500");
    });

    it("should update cart badge when item count changes", () => {
      const { rerender } = renderHeader(
        {
          user: mockUser,
          isAuthenticated: true,
          isAdmin: false,
        },
        {
          itemCount: 2,
        },
      );

      // Initial count
      expect(screen.getByText("2")).toBeInTheDocument();

      // Update count
      const defaultAuthContext: AuthContextType = {
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      };

      const updatedCartContext: CartContextType = {
        items: [],
        itemCount: 5,
        totalPrice: 0,
        isLoading: false,
        addItem: vi.fn(),
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
        refreshCart: vi.fn(),
      };

      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={defaultAuthContext}>
            <CartContext.Provider value={updatedCartContext}>
              <Header />
            </CartContext.Provider>
          </AuthContext.Provider>
        </BrowserRouter>,
      );

      // Updated count
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.queryByText("2")).not.toBeInTheDocument();
    });
  });
});
