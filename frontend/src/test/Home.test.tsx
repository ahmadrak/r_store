import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Home from "../pages/Home";
import { productsApi } from "../api/products";
import { categoriesApi } from "../api/categories";
import type { ProductWithImages } from "../api/products";
import type { Category } from "../types";

// Mock the API modules
vi.mock("../api/products");
vi.mock("../api/categories");

describe("Home Page", () => {
  let queryClient: QueryClient;

  // Sample test data
  const mockCategories: Category[] = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Books" },
  ];

  const mockProducts: ProductWithImages[] = [
    {
      id: 1,
      name: "Laptop",
      description: "High-performance laptop",
      price: 999.99,
      stock: 10,
      category_id: 1,
      category: { id: 1, name: "Electronics" },
      created_at: "2024-01-01T00:00:00Z",
      images: [],
    },
    {
      id: 2,
      name: "T-Shirt",
      description: "Comfortable cotton t-shirt",
      price: 19.99,
      stock: 50,
      category_id: 2,
      category: { id: 2, name: "Clothing" },
      created_at: "2024-01-02T00:00:00Z",
      images: [],
    },
    {
      id: 3,
      name: "Novel",
      description: "Bestselling fiction novel",
      price: 14.99,
      stock: 30,
      category_id: 3,
      category: { id: 3, name: "Books" },
      created_at: "2024-01-03T00:00:00Z",
      images: [],
    },
  ];

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  describe("Initial Rendering", () => {
    it("should render the page header", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      expect(
        screen.getByRole("heading", { name: /find something you’ll love/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/explore our curated selection of products/i),
      ).toBeInTheDocument();
    });

    it("should display loading state initially", () => {
      vi.mocked(categoriesApi.getAll).mockImplementation(
        () => new Promise(() => {}),
      );
      vi.mocked(productsApi.getAll).mockImplementation(
        () => new Promise(() => {}),
      );

      renderHome();

      // Should show loading skeletons
      expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();
    });
  });

  describe("Product Display", () => {
    it("should fetch and display all products", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Novel")).toBeInTheDocument();
    });

    it("should display product details correctly", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      // Check that prices are displayed
      expect(screen.getByText("$999.99")).toBeInTheDocument();
      expect(screen.getByText("$19.99")).toBeInTheDocument();
      expect(screen.getByText("$14.99")).toBeInTheDocument();

      // Check that categories are displayed
      expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Clothing").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Books").length).toBeGreaterThan(0);
    });

    it("should display empty state when no products are available", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId("product-grid-empty")).toBeInTheDocument();
      });

      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    });
  });

  describe("Category Filtering", () => {
    it("should display category filter with all categories", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Wait for categories to load and buttons to appear
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /filter by electronics/i }),
        ).toBeInTheDocument();
      });

      // Check that all category buttons are present
      expect(
        screen.getByRole("button", { name: /all products/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /filter by clothing/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /filter by books/i }),
      ).toBeInTheDocument();
    });

    it("should filter products when a category is selected", async () => {
      const user = userEvent.setup();
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);

      // First call returns all products
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      // All products should be visible initially
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Novel")).toBeInTheDocument();

      // Click on Electronics category
      const electronicsButton = screen.getByRole("button", {
        name: /filter by electronics/i,
      });
      await user.click(electronicsButton);

      // Wait for filtered products to load
      await waitFor(() => {
        // Only electronics product should be visible
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.queryByText("T-Shirt")).not.toBeInTheDocument();
        expect(screen.queryByText("Novel")).not.toBeInTheDocument();
      });
    });

    it("should show all products when 'All Products' is selected", async () => {
      const user = userEvent.setup();
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      // Click on a specific category first
      const electronicsButton = screen.getByRole("button", {
        name: /filter by electronics/i,
      });
      await user.click(electronicsButton);

      // Wait for filter to apply
      await waitFor(() => {
        expect(screen.queryByText("T-Shirt")).not.toBeInTheDocument();
      });

      // Click on "All Products"
      const allProductsButton = screen.getByRole("button", {
        name: /show all products/i,
      });
      await user.click(allProductsButton);

      // All products should be visible again
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
        expect(screen.getByText("Novel")).toBeInTheDocument();
      });
    });

    it("should highlight the selected category", async () => {
      const user = userEvent.setup();
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Wait for categories to load
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /filter by electronics/i }),
        ).toBeInTheDocument();
      });

      // Initially, "All Products" should be selected
      const allProductsButton = screen.getByRole("button", {
        name: /show all products/i,
      });
      expect(allProductsButton).toHaveAttribute("aria-pressed", "true");

      // Click on Electronics
      const electronicsButton = screen.getByRole("button", {
        name: /filter by electronics/i,
      });
      await user.click(electronicsButton);

      // Electronics should now be selected
      await waitFor(() => {
        expect(electronicsButton).toHaveAttribute("aria-pressed", "true");
        expect(allProductsButton).toHaveAttribute("aria-pressed", "false");
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when products fail to load", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockRejectedValue(
        new Error("Failed to fetch products"),
      );

      renderHome();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch products/i)).toBeInTheDocument();
    });

    it("should display error message when categories fail to load", async () => {
      vi.mocked(categoriesApi.getAll).mockRejectedValue(
        new Error("Failed to fetch categories"),
      );
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      await waitFor(() => {
        expect(
          screen.getByText(/failed to load categories/i),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(/failed to fetch categories/i),
      ).toBeInTheDocument();
    });

    it("should provide a retry button when products fail to load", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockRejectedValue(
        new Error("Network error"),
      );

      renderHome();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /retry/i }),
        ).toBeInTheDocument();
      });
    });

    it("should still display products when categories fail to load", async () => {
      vi.mocked(categoriesApi.getAll).mockRejectedValue(
        new Error("Failed to fetch categories"),
      );
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Should show category error
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load categories/i),
        ).toBeInTheDocument();
      });

      // But products should still be displayed
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Novel")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading skeletons while products are loading", () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockImplementation(
        () => new Promise(() => {}),
      );

      renderHome();

      expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();
      expect(screen.getAllByTestId("product-skeleton")).toHaveLength(8);
    });

    it("should hide loading skeletons after products load", async () => {
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // Initially shows loading
      expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();

      // After loading, skeletons should be gone
      await waitFor(() => {
        expect(
          screen.queryByTestId("product-grid-loading"),
        ).not.toBeInTheDocument();
      });

      // Products should be visible
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should handle complete user flow: load -> filter -> reset", async () => {
      const user = userEvent.setup();
      vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories);
      vi.mocked(productsApi.getAll).mockResolvedValue(mockProducts);

      renderHome();

      // 1. Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      // All products visible
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Novel")).toBeInTheDocument();

      // 2. Filter by Clothing
      const clothingButton = screen.getByRole("button", {
        name: /filter by clothing/i,
      });
      await user.click(clothingButton);

      // Only clothing product visible
      await waitFor(() => {
        expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
        expect(screen.queryByText("Novel")).not.toBeInTheDocument();
      });

      // 3. Reset to all products
      const allProductsButton = screen.getByRole("button", {
        name: /show all products/i,
      });
      await user.click(allProductsButton);

      // All products visible again
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
        expect(screen.getByText("Novel")).toBeInTheDocument();
      });
    });
  });
});
