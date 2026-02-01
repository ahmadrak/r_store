import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProducts } from "../hooks/useProducts";
import type { ProductWithImages } from "../api/products";
import React from "react";

/**
 * Unit tests for useProducts hook
 *
 * Tests verify that:
 * - Hook fetches all products correctly
 * - Hook filters products by category when categoryId is provided
 * - Hook handles loading states
 * - Hook handles error states
 * - Hook caches data properly with TanStack Query
 */

// Mock product data for testing
const mockProducts: ProductWithImages[] = [
  {
    id: 1,
    name: "Product 1",
    description: "Description 1",
    price: 29.99,
    stock: 100,
    category_id: 1,
    category: { id: 1, name: "Electronics" },
    created_at: "2024-01-01T00:00:00.000Z",
    images: [
      {
        id: 1,
        product_id: 1,
        image_url: "https://example.com/image1.jpg",
        is_main: true,
      },
    ],
  },
  {
    id: 2,
    name: "Product 2",
    description: "Description 2",
    price: 49.99,
    stock: 50,
    category_id: 2,
    category: { id: 2, name: "Clothing" },
    created_at: "2024-01-02T00:00:00.000Z",
    images: [
      {
        id: 2,
        product_id: 2,
        image_url: "https://example.com/image2.jpg",
        is_main: true,
      },
    ],
  },
  {
    id: 3,
    name: "Product 3",
    description: "Description 3",
    price: 19.99,
    stock: 200,
    category_id: 1,
    category: { id: 1, name: "Electronics" },
    created_at: "2024-01-03T00:00:00.000Z",
    images: [],
  },
];

// Setup MSW server for API mocking
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper function to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: 0, // Disable cache time for tests
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useProducts", () => {
  describe("fetching all products", () => {
    it("should fetch all products successfully", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      // Assert - initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - data loaded
      expect(result.current.data).toEqual(mockProducts);
      expect(result.current.data).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should return empty array when no products exist", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toEqual([]);
      expect(result.current.data).toHaveLength(0);
    });

    it("should handle API errors", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(
            { message: "Database connection failed" },
            { status: 500 },
          );
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Assert
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("filtering by category", () => {
    it("should filter products by category ID", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act - filter by category 1 (Electronics)
      const { result } = renderHook(() => useProducts(1), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - only products with category_id 1
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].category_id).toBe(1);
      expect(result.current.data?.[1].category_id).toBe(1);
      expect(result.current.data?.[0].name).toBe("Product 1");
      expect(result.current.data?.[1].name).toBe("Product 3");
    });

    it("should filter products by different category ID", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act - filter by category 2 (Clothing)
      const { result } = renderHook(() => useProducts(2), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - only products with category_id 2
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].category_id).toBe(2);
      expect(result.current.data?.[0].name).toBe("Product 2");
    });

    it("should return empty array when no products match category", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act - filter by non-existent category
      const { result } = renderHook(() => useProducts(999), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toEqual([]);
      expect(result.current.data).toHaveLength(0);
    });

    it("should return all products when categoryId is undefined", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(undefined), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - all products returned
      expect(result.current.data).toEqual(mockProducts);
      expect(result.current.data).toHaveLength(3);
    });
  });

  describe("caching behavior", () => {
    it("should use different cache keys for different categories", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      const wrapper = createWrapper();

      // Act - fetch all products
      const { result: result1 } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Act - fetch category 1 products
      const { result: result2 } = renderHook(() => useProducts(1), { wrapper });

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Assert - both queries should have data
      expect(result1.current.data).toHaveLength(3);
      expect(result2.current.data).toHaveLength(2);
    });
  });

  describe("loading states", () => {
    it("should show loading state initially", () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", async () => {
          // Delay response to test loading state
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      // Assert - should be loading initially
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it("should clear loading state after data loads", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - loading should be false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeDefined();
    });
  });

  describe("hook interface", () => {
    it("should return TanStack Query result object", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - check for TanStack Query properties
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("isSuccess");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("refetch");
    });
  });
});
