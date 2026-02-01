import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import type { Product } from "../types";

/**
 * Test suite for ProductCard component
 *
 * Validates that the ProductCard component:
 * - Displays all required product information (name, price, category, stock)
 * - Shows product image or placeholder
 * - Handles out-of-stock products correctly
 * - Navigates to product detail page on click
 * - Calls onAddToCart callback when add to cart button is clicked
 * - Disables add to cart button when out of stock
 *
 * Requirements: 2.3, 2.6
 */

// Helper function to wrap component with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Mock product data
const mockProduct: Product = {
  id: 1,
  name: "Test Product",
  description: "Test description",
  price: 29.99,
  stock: 10,
  category_id: 1,
  category: {
    id: 1,
    name: "Electronics",
  },
  main_image_url: "https://example.com/image.jpg",
  created_at: "2024-01-01T00:00:00Z",
};

const mockOutOfStockProduct: Product = {
  ...mockProduct,
  id: 2,
  name: "Out of Stock Product",
  stock: 0,
};

const mockProductWithoutImage: Product = {
  ...mockProduct,
  id: 3,
  name: "Product Without Image",
  main_image_url: null,
};

const mockLowStockProduct: Product = {
  ...mockProduct,
  id: 4,
  name: "Low Stock Product",
  stock: 5,
};

describe("ProductCard component", () => {
  describe("Product Information Display", () => {
    it("should display product name", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should display product price formatted as currency", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      expect(screen.getByText("$29.99")).toBeInTheDocument();
    });

    it("should display category name", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    it("should display stock quantity when in stock", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      expect(screen.getByText("10 in stock")).toBeInTheDocument();
    });

    it("should display 'In stock' indicator when stock is sufficient", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      expect(screen.getByText("In stock")).toBeInTheDocument();
    });

    it("should display 'Low stock' indicator when stock is below 10", () => {
      renderWithRouter(<ProductCard product={mockLowStockProduct} />);
      expect(screen.getByText("Low stock")).toBeInTheDocument();
    });
  });

  describe("Product Image", () => {
    it("should display product image when main_image_url is provided", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    it("should display placeholder icon when main_image_url is null", () => {
      renderWithRouter(<ProductCard product={mockProductWithoutImage} />);
      // Check for the placeholder SVG by looking for the container
      const card = screen.getByTestId("product-card");
      const placeholder = card.querySelector("svg");
      expect(placeholder).toBeInTheDocument();
    });

    it("should have lazy loading attribute on image", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const image = screen.getByAltText("Test Product");
      expect(image).toHaveAttribute("loading", "lazy");
    });
  });

  describe("Out of Stock Handling", () => {
    it("should display 'Out of Stock' overlay when stock is 0", () => {
      renderWithRouter(<ProductCard product={mockOutOfStockProduct} />);
      // Check for overlay text
      const overlayText = screen.getAllByText("Out of Stock");
      expect(overlayText.length).toBeGreaterThan(0);
    });

    it("should display 'Unavailable' indicator when out of stock", () => {
      renderWithRouter(<ProductCard product={mockOutOfStockProduct} />);
      expect(screen.getByText("Unavailable")).toBeInTheDocument();
    });

    it("should disable add to cart button when out of stock", () => {
      renderWithRouter(<ProductCard product={mockOutOfStockProduct} />);
      const buttons = screen.getAllByRole("button");
      const addToCartButton = buttons.find((btn) =>
        btn.textContent?.includes("Out of Stock"),
      );
      expect(addToCartButton).toBeDisabled();
      expect(addToCartButton).toHaveAttribute("aria-disabled", "true");
    });

    it("should not display stock quantity when out of stock", () => {
      renderWithRouter(<ProductCard product={mockOutOfStockProduct} />);
      expect(screen.queryByText(/in stock/)).not.toBeInTheDocument();
    });
  });

  describe("Add to Cart Button", () => {
    it("should display 'Add to Cart' button when in stock", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const button = screen.getByRole("button", { name: /Add.*to cart/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it("should call onAddToCart callback when button is clicked", () => {
      const onAddToCart = vi.fn();
      renderWithRouter(
        <ProductCard product={mockProduct} onAddToCart={onAddToCart} />,
      );

      const button = screen.getByRole("button", { name: /Add.*to cart/i });
      fireEvent.click(button);

      expect(onAddToCart).toHaveBeenCalledTimes(1);
      expect(onAddToCart).toHaveBeenCalledWith(mockProduct.id);
    });

    it("should not call onAddToCart when button is clicked and product is out of stock", () => {
      const onAddToCart = vi.fn();
      renderWithRouter(
        <ProductCard
          product={mockOutOfStockProduct}
          onAddToCart={onAddToCart}
        />,
      );

      const buttons = screen.getAllByRole("button");
      const addToCartButton = buttons.find((btn) =>
        btn.textContent?.includes("Out of Stock"),
      );
      if (addToCartButton) {
        fireEvent.click(addToCartButton);
      }

      expect(onAddToCart).not.toHaveBeenCalled();
    });

    it("should not call onAddToCart when callback is not provided", () => {
      // This should not throw an error
      renderWithRouter(<ProductCard product={mockProduct} />);

      const button = screen.getByRole("button", { name: /Add.*to cart/i });
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe("Navigation to Product Detail", () => {
    it("should have cursor-pointer class for clickable card", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const card = screen.getByTestId("product-card");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should not navigate when add to cart button is clicked", () => {
      const onAddToCart = vi.fn();
      renderWithRouter(
        <ProductCard product={mockProduct} onAddToCart={onAddToCart} />,
      );

      const button = screen.getByRole("button", { name: /Add.*to cart/i });
      fireEvent.click(button);

      // The button click should stop propagation, so only onAddToCart should be called
      expect(onAddToCart).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("aria-label", "Product: Test Product");
    });

    it("should have proper ARIA label for add to cart button", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const button = screen.getByRole("button", {
        name: "Add Test Product to cart",
      });
      expect(button).toBeInTheDocument();
    });

    it("should have proper ARIA label for disabled button", () => {
      renderWithRouter(<ProductCard product={mockOutOfStockProduct} />);
      const buttons = screen.getAllByRole("button");
      const addToCartButton = buttons.find((btn) =>
        btn.textContent?.includes("Out of Stock"),
      );
      expect(addToCartButton).toHaveAttribute("aria-label", "Out of stock");
      expect(addToCartButton).toHaveAttribute("aria-disabled", "true");
    });

    it("should have alt text for product image", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("should have proper Tailwind CSS classes for card layout", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const card = screen.getByTestId("product-card");
      expect(card).toHaveClass("bg-white");
      expect(card).toHaveClass("rounded-lg");
      expect(card).toHaveClass("shadow-md");
    });

    it("should have hover effect classes", () => {
      renderWithRouter(<ProductCard product={mockProduct} />);
      const card = screen.getByTestId("product-card");
      expect(card).toHaveClass("hover:shadow-xl");
      expect(card).toHaveClass("transition-all");
      expect(card).toHaveClass("duration-300");
    });

    it("should apply disabled styling to out of stock button", () => {
      renderWithRouter(<ProductCard product={mockOutOfStockProduct} />);
      const buttons = screen.getAllByRole("button");
      const addToCartButton = buttons.find((btn) =>
        btn.textContent?.includes("Out of Stock"),
      );
      expect(addToCartButton).toHaveClass("bg-gray-300");
      expect(addToCartButton).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle product without category", () => {
      const productWithoutCategory: Product = {
        ...mockProduct,
        category: undefined,
      };
      renderWithRouter(<ProductCard product={productWithoutCategory} />);
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });

    it("should handle very long product names", () => {
      const longNameProduct: Product = {
        ...mockProduct,
        name: "This is a very long product name that should be truncated with line clamp to prevent layout issues",
      };
      renderWithRouter(<ProductCard product={longNameProduct} />);
      const productName = screen.getByText(longNameProduct.name);
      expect(productName).toHaveClass("line-clamp-2");
    });

    it("should format large prices correctly", () => {
      const expensiveProduct: Product = {
        ...mockProduct,
        price: 1234.56,
      };
      renderWithRouter(<ProductCard product={expensiveProduct} />);
      expect(screen.getByText("$1,234.56")).toBeInTheDocument();
    });

    it("should format small prices correctly", () => {
      const cheapProduct: Product = {
        ...mockProduct,
        price: 0.99,
      };
      renderWithRouter(<ProductCard product={cheapProduct} />);
      expect(screen.getByText("$0.99")).toBeInTheDocument();
    });
  });
});
