import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFilter from "../components/product/CategoryFilter";
import type { Category } from "../types";

describe("CategoryFilter", () => {
  const mockCategories: Category[] = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Books" },
  ];

  it("renders all categories and All Products option", () => {
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={null}
        onCategorySelect={onCategorySelect}
      />,
    );

    // Check that "All Products" is rendered
    expect(screen.getByText("All Products")).toBeInTheDocument();

    // Check that all categories are rendered
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Books")).toBeInTheDocument();
  });

  it("highlights All Products when no category is selected", () => {
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={null}
        onCategorySelect={onCategorySelect}
      />,
    );

    const allProductsButton = screen.getByText("All Products");

    // Check that All Products has the active styling
    expect(allProductsButton).toHaveClass("bg-blue-600", "text-white");
    expect(allProductsButton).toHaveAttribute("aria-pressed", "true");
  });

  it("highlights the selected category", () => {
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={2}
        onCategorySelect={onCategorySelect}
      />,
    );

    const clothingButton = screen.getByText("Clothing");
    const electronicsButton = screen.getByText("Electronics");
    const allProductsButton = screen.getByText("All Products");

    // Check that Clothing has the active styling
    expect(clothingButton).toHaveClass("bg-blue-600", "text-white");
    expect(clothingButton).toHaveAttribute("aria-pressed", "true");

    // Check that other buttons don't have active styling
    expect(electronicsButton).toHaveClass("bg-gray-100", "text-gray-700");
    expect(electronicsButton).toHaveAttribute("aria-pressed", "false");
    expect(allProductsButton).toHaveClass("bg-gray-100", "text-gray-700");
    expect(allProductsButton).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onCategorySelect with null when All Products is clicked", async () => {
    const user = userEvent.setup();
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={1}
        onCategorySelect={onCategorySelect}
      />,
    );

    const allProductsButton = screen.getByText("All Products");
    await user.click(allProductsButton);

    expect(onCategorySelect).toHaveBeenCalledWith(null);
    expect(onCategorySelect).toHaveBeenCalledTimes(1);
  });

  it("calls onCategorySelect with category id when a category is clicked", async () => {
    const user = userEvent.setup();
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={null}
        onCategorySelect={onCategorySelect}
      />,
    );

    const electronicsButton = screen.getByText("Electronics");
    await user.click(electronicsButton);

    expect(onCategorySelect).toHaveBeenCalledWith(1);
    expect(onCategorySelect).toHaveBeenCalledTimes(1);
  });

  it("renders correctly with empty categories array", () => {
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={[]}
        selectedCategoryId={null}
        onCategorySelect={onCategorySelect}
      />,
    );

    // Should still render "All Products"
    expect(screen.getByText("All Products")).toBeInTheDocument();

    // Should not render any category buttons
    expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const onCategorySelect = vi.fn();

    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={1}
        onCategorySelect={onCategorySelect}
      />,
    );

    const electronicsButton = screen.getByText("Electronics");

    // Check aria-label
    expect(electronicsButton).toHaveAttribute(
      "aria-label",
      "Filter by Electronics",
    );

    // Check aria-pressed
    expect(electronicsButton).toHaveAttribute("aria-pressed", "true");
  });

  it("updates highlight when selectedCategoryId changes", () => {
    const onCategorySelect = vi.fn();

    const { rerender } = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={1}
        onCategorySelect={onCategorySelect}
      />,
    );

    // Initially Electronics should be highlighted
    expect(screen.getByText("Electronics")).toHaveClass("bg-blue-600");

    // Rerender with different selected category
    rerender(
      <CategoryFilter
        categories={mockCategories}
        selectedCategoryId={2}
        onCategorySelect={onCategorySelect}
      />,
    );

    // Now Clothing should be highlighted
    expect(screen.getByText("Clothing")).toHaveClass("bg-blue-600");
    expect(screen.getByText("Electronics")).toHaveClass("bg-gray-100");
  });
});
