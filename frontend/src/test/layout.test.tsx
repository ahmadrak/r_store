import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { NotificationProvider } from "../contexts/NotificationContext";

// Mock the auth API
vi.mock("../api/auth", () => ({
  authApi: {
    getCurrentUser: vi.fn().mockRejectedValue(new Error("Not authenticated")),
  },
}));

/**
 * Test wrapper that provides all necessary context providers
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

describe("Layout Component", () => {
  it("should render Header, children, and Footer", () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </TestWrapper>,
    );

    // Check that Header is rendered (look for E-Shop logo)
    expect(screen.getByText("E-Shop")).toBeInTheDocument();

    // Check that children content is rendered
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();

    // Check that Footer is rendered (look for copyright text)
    expect(
      screen.getByText(/© \d{4} E-Shop. All rights reserved./),
    ).toBeInTheDocument();
  });

  it("should render multiple children correctly", () => {
    render(
      <TestWrapper>
        <Layout>
          <h1>Page Title</h1>
          <p>Page content paragraph</p>
          <button>Action Button</button>
        </Layout>
      </TestWrapper>,
    );

    // All children should be rendered
    expect(screen.getByText("Page Title")).toBeInTheDocument();
    expect(screen.getByText("Page content paragraph")).toBeInTheDocument();
    expect(screen.getByText("Action Button")).toBeInTheDocument();
  });

  it("should have proper flex layout structure", () => {
    const { container } = render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>,
    );

    // The root div should have flex and min-h-screen classes
    const layoutRoot = container.querySelector(".flex.flex-col.min-h-screen");
    expect(layoutRoot).toBeInTheDocument();

    // Main content should have flex-grow class
    const mainContent = container.querySelector("main.flex-grow");
    expect(mainContent).toBeInTheDocument();
  });

  it("should render empty children without errors", () => {
    render(
      <TestWrapper>
        <Layout>
          <></>
        </Layout>
      </TestWrapper>,
    );

    // Header and Footer should still be present
    expect(screen.getByText("E-Shop")).toBeInTheDocument();
    expect(
      screen.getByText(/© \d{4} E-Shop. All rights reserved./),
    ).toBeInTheDocument();
  });
});
