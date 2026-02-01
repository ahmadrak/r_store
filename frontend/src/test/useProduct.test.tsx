import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProduct } from "../hooks/useProduct";
import type { ProductWithImages } from "../api/products";
import React from "react";

/**
 * Unit tests for useProduct hook
 *
 * Tests verify that:
 * - Hook fetches a single product by ID correctly
 * - Hook handles loading states
 * - Hook handles error states (product not found)
 * - Hook is disabled when ID is falsy
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

describe("useProduct", () => {
  describe("fetching single product", () => {
    it("should fetch product by ID successfully", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(1), {
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
      expect(result.current.data).toEqual(mockProducts[0]);
      expect(result.current.data?.id).toBe(1);
      expect(result.current.data?.name).toBe("Product 1");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should fetch different product by different ID", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(2), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toEqual(mockProducts[1]);
      expect(result.current.data?.id).toBe(2);
      expect(result.current.data?.name).toBe("Product 2");
    });

    it("should handle product not found error", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act - request non-existent product
      const { result } = renderHook(() => useProduct(999), {
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
      const { result } = renderHook(() => useProduct(1), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Assert
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("query enablement", () => {
    it("should not fetch when ID is 0", () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          // This should not be called
          throw new Error("Query should not run with ID 0");
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(0), {
        wrapper: createWrapper(),
      });

      // Assert - query should be disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe("idle");
    });

    it("should fetch when ID is valid positive number", async () => {
      // Arrange
      let fetchCalled = false;
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          fetchCalled = true;
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(1), {
        wrapper: createWrapper(),
      });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(fetchCalled).toBe(true);
      expect(result.current.data).toBeDefined();
    });
  });

  describe("caching behavior", () => {
    it("should use different cache keys for different product IDs", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      const wrapper = createWrapper();

      // Act - fetch product 1
      const { result: result1 } = renderHook(() => useProduct(1), { wrapper });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Act - fetch product 2
      const { result: result2 } = renderHook(() => useProduct(2), { wrapper });

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Assert - both queries should have different data
      expect(result1.current.data?.id).toBe(1);
      expect(result2.current.data?.id).toBe(2);
      expect(result1.current.data?.name).toBe("Product 1");
      expect(result2.current.data?.name).toBe("Product 2");
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
      const { result } = renderHook(() => useProduct(1), {
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
      const { result } = renderHook(() => useProduct(1), {
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

    it("should clear loading state after error", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json({ message: "Error" }, { status: 500 });
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(1), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Assert - loading should be false
      expect(result.current.isLoading).toBe(false);
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
      const { result } = renderHook(() => useProduct(1), {
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

  describe("product data structure", () => {
    it("should return product with images array", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toHaveProperty("images");
      expect(Array.isArray(result.current.data?.images)).toBe(true);
      expect(result.current.data?.images).toHaveLength(1);
      expect(result.current.data?.images[0]).toHaveProperty("image_url");
      expect(result.current.data?.images[0]).toHaveProperty("is_main");
    });

    it("should return product with category information", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const { result } = renderHook(() => useProduct(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toHaveProperty("category");
      expect(result.current.data?.category).toHaveProperty("id");
      expect(result.current.data?.category).toHaveProperty("name");
      expect(result.current.data?.category?.name).toBe("Electronics");
    });
  });
});
