import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Footer } from "../components/layout/Footer";

/**
 * Footer Component Tests
 *
 * Tests for the Footer component to ensure it renders correctly
 * with copyright information and navigation links.
 */
describe("Footer Component", () => {
  /**
   * Helper function to render Footer with Router context
   */
  const renderFooter = () => {
    return render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );
  };

  it("should render copyright notice with current year", () => {
    renderFooter();
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} E-Shop`)),
    ).toBeInTheDocument();
  });

  it("should render all footer links", () => {
    renderFooter();

    // Check for all expected links
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /privacy policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /terms of service/i }),
    ).toBeInTheDocument();
  });

  it("should have correct link hrefs", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(
      screen.getByRole("link", { name: /privacy policy/i }),
    ).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("link", { name: /terms of service/i }),
    ).toHaveAttribute("href", "/terms");
  });

  it("should render as a footer element", () => {
    const { container } = renderFooter();
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });
});
