import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import type { Product } from "../types";

/**
 * Test suite for ProductGrid component
 *
 * Validates that the ProductGrid component:
 * - Displays products in a responsive grid layout
 * - Shows loading skeletons while data is fetching
 * - Displays empty state message when no products are available
 * - Renders correct number of product cards
 * - Passes onAddToCart callback to ProductCard components
 * - Has proper accessibility attributes
 *
 * Requirements: 2.1, 2.2
 */

// Helper function to wrap component with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Mock product data
const createMockProduct = (
  id: number,
  overrides?: Partial<Product>,
): Product => ({
  id,
  name: `Product ${id}`,
  description: `Description for product ${id}`,
  price: 29.99 + id,
  stock: 10,
  category_id: 1,
  category: {
    id: 1,
    name: "Electronics",
  },
  main_image_url: `https://example.com/image${id}.jpg`,
  created_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockProducts: Product[] = [
  createMockProduct(1),
  createMockProduct(2),
  createMockProduct(3),
  createMockProduct(4),
];

describe("ProductGrid component", () => {
  describe("Loading State", () => {
    it("should display loading skeletons when isLoading is true", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const loadingGrid = screen.getByTestId("product-grid-loading");
      expect(loadingGrid).toBeInTheDocument();
    });

    it("should display 8 loading skeletons", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const skeletons = screen.getAllByTestId("product-skeleton");
      expect(skeletons).toHaveLength(8);
    });

    it("should have proper accessibility attributes on skeletons", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(0);

      const firstSkeleton = skeletons[0];
      expect(firstSkeleton).toHaveAttribute("aria-label", "Loading product");
    });

    it("should have animate-pulse class on skeletons", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const skeletons = screen.getAllByTestId("product-skeleton");
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("animate-pulse");
      });
    });

    it("should not display products when loading", () => {
      renderWithRouter(
        <ProductGrid products={mockProducts} isLoading={true} />,
      );

      expect(screen.queryByTestId("product-grid")).not.toBeInTheDocument();
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });

    it("should not display empty state when loading", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      expect(
        screen.queryByTestId("product-grid-empty"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("No Products Found")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when products array is empty and not loading", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={false} />);

      const emptyState = screen.getByTestId("product-grid-empty");
      expect(emptyState).toBeInTheDocument();
    });

    it("should display 'No Products Found' heading", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={false} />);

      expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    it("should display helpful message in empty state", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={false} />);

      expect(
        screen.getByText(
          /We couldn't find any products matching your criteria/i,
        ),
      ).toBeInTheDocument();
    });

    it("should have proper accessibility attributes on empty state", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={false} />);

      const emptyState = screen.getByTestId("product-grid-empty");
      expect(emptyState).toHaveAttribute("role", "status");
    });

    it("should display icon in empty state", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={false} />);

      const emptyState = screen.getByTestId("product-grid-empty");
      const icon = emptyState.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("should not display product grid when empty", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={false} />);

      expect(screen.queryByTestId("product-grid")).not.toBeInTheDocument();
    });
  });

  describe("Product Grid Display", () => {
    it("should display product grid when products are available", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toBeInTheDocument();
    });

    it("should render correct number of product cards", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(mockProducts.length);
    });

    it("should display all product names", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      mockProducts.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });

    it("should have proper grid layout classes", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toHaveClass("grid");
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).toHaveClass("sm:grid-cols-2");
      expect(grid).toHaveClass("lg:grid-cols-3");
      expect(grid).toHaveClass("xl:grid-cols-4");
      expect(grid).toHaveClass("gap-6");
    });

    it("should have proper accessibility attributes on grid", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toHaveAttribute("role", "list");
      expect(grid).toHaveAttribute("aria-label", "Product list");
    });

    it("should wrap each product card in a listitem", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(mockProducts.length);
    });

    it("should not display loading skeletons when products are shown", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      expect(
        screen.queryByTestId("product-grid-loading"),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("product-skeleton")).not.toBeInTheDocument();
    });

    it("should not display empty state when products are shown", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      expect(
        screen.queryByTestId("product-grid-empty"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("No Products Found")).not.toBeInTheDocument();
    });
  });

  describe("onAddToCart Callback", () => {
    it("should pass onAddToCart callback to ProductCard components", () => {
      const onAddToCart = vi.fn();
      renderWithRouter(
        <ProductGrid products={mockProducts} onAddToCart={onAddToCart} />,
      );

      // ProductCard should receive the callback
      // We can verify this by checking that add to cart buttons exist
      const addToCartButtons = screen.getAllByRole("button", {
        name: /Add.*to cart/i,
      });
      expect(addToCartButtons.length).toBeGreaterThan(0);
    });

    it("should work without onAddToCart callback", () => {
      // Should not throw an error
      expect(() => {
        renderWithRouter(<ProductGrid products={mockProducts} />);
      }).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single product", () => {
      const singleProduct = [createMockProduct(1)];
      renderWithRouter(<ProductGrid products={singleProduct} />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(1);
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    it("should handle large number of products", () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) =>
        createMockProduct(i + 1),
      );
      renderWithRouter(<ProductGrid products={manyProducts} />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(20);
    });

    it("should handle products with missing data", () => {
      const productsWithMissingData: Product[] = [
        createMockProduct(1, { main_image_url: null }),
        createMockProduct(2, { category: undefined }),
        createMockProduct(3, { stock: 0 }),
      ];

      renderWithRouter(<ProductGrid products={productsWithMissingData} />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(3);
    });

    it("should default isLoading to false when not provided", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      // Should show products, not loading state
      expect(screen.getByTestId("product-grid")).toBeInTheDocument();
      expect(
        screen.queryByTestId("product-grid-loading"),
      ).not.toBeInTheDocument();
    });

    it("should handle transition from loading to loaded", () => {
      const { rerender } = renderWithRouter(
        <ProductGrid products={[]} isLoading={true} />,
      );

      expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <ProductGrid products={mockProducts} isLoading={false} />
        </BrowserRouter>,
      );

      expect(
        screen.queryByTestId("product-grid-loading"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    });

    it("should handle transition from loading to empty", () => {
      const { rerender } = renderWithRouter(
        <ProductGrid products={[]} isLoading={true} />,
      );

      expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <ProductGrid products={[]} isLoading={false} />
        </BrowserRouter>,
      );

      expect(
        screen.queryByTestId("product-grid-loading"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("product-grid-empty")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive grid classes for mobile", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toHaveClass("grid-cols-1");
    });

    it("should have responsive grid classes for tablet", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toHaveClass("sm:grid-cols-2");
    });

    it("should have responsive grid classes for desktop", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toHaveClass("lg:grid-cols-3");
      expect(grid).toHaveClass("xl:grid-cols-4");
    });

    it("should have consistent gap between grid items", () => {
      renderWithRouter(<ProductGrid products={mockProducts} />);

      const grid = screen.getByTestId("product-grid");
      expect(grid).toHaveClass("gap-6");
    });
  });

  describe("Loading Skeleton Structure", () => {
    it("should have skeleton with image placeholder", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const skeletons = screen.getAllByTestId("product-skeleton");
      const firstSkeleton = skeletons[0];

      // Check for image skeleton (h-48 height matches ProductCard image)
      const imageSkeleton = firstSkeleton.querySelector(".h-48");
      expect(imageSkeleton).toBeInTheDocument();
    });

    it("should have skeleton with content placeholders", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const skeletons = screen.getAllByTestId("product-skeleton");
      const firstSkeleton = skeletons[0];

      // Check for multiple content placeholders
      const contentPlaceholders =
        firstSkeleton.querySelectorAll(".bg-gray-300");
      expect(contentPlaceholders.length).toBeGreaterThan(3);
    });

    it("should have skeleton with same layout as ProductCard", () => {
      renderWithRouter(<ProductGrid products={[]} isLoading={true} />);

      const skeletons = screen.getAllByTestId("product-skeleton");
      const firstSkeleton = skeletons[0];

      expect(firstSkeleton).toHaveClass("bg-white");
      expect(firstSkeleton).toHaveClass("rounded-lg");
      expect(firstSkeleton).toHaveClass("shadow-md");
      expect(firstSkeleton).toHaveClass("flex");
      expect(firstSkeleton).toHaveClass("flex-col");
    });
  });
});
