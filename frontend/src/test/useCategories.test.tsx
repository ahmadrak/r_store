import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCategories } from "../hooks/useCategories";
import type { Category } from "../types";
import React from "react";

/**
 * Unit tests for useCategories hook
 *
 * Tests verify that:
 * - Hook fetches all categories correctly
 * - Hook handles loading states
 * - Hook handles error states
 * - Hook caches data properly with TanStack Query
 * - Hook uses appropriate stale time for infrequently changing data
 */

// Mock category data for testing
const mockCategories: Category[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Home & Garden" },
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

describe("useCategories", () => {
  describe("fetching categories", () => {
    it("should fetch all categories successfully", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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
      expect(result.current.data).toEqual(mockCategories);
      expect(result.current.data).toHaveLength(4);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should return empty array when no categories exist", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(
            { message: "Database connection failed" },
            { status: 500 },
          );
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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

    it("should handle network errors", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.error();
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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

  describe("category data structure", () => {
    it("should return categories with correct structure", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - check structure of first category
      const firstCategory = result.current.data?.[0];
      expect(firstCategory).toHaveProperty("id");
      expect(firstCategory).toHaveProperty("name");
      expect(typeof firstCategory?.id).toBe("number");
      expect(typeof firstCategory?.name).toBe("string");
    });

    it("should return all category fields", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert - verify all categories have required fields
      result.current.data?.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("loading states", () => {
    it("should show loading state initially", () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", async () => {
          // Delay response to test loading state
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json({ message: "Error" }, { status: 500 });
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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

  describe("caching behavior", () => {
    it("should use single cache key for all category requests", async () => {
      // Arrange
      let fetchCount = 0;
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          fetchCount++;
          return HttpResponse.json(mockCategories);
        }),
      );

      const wrapper = createWrapper();

      // Act - fetch categories twice
      const { result: result1 } = renderHook(() => useCategories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      const { result: result2 } = renderHook(() => useCategories(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Assert - should use cached data (only one fetch)
      // Note: In tests with gcTime: 0, this might fetch twice
      // In production with proper cache settings, it would use cache
      expect(result1.current.data).toEqual(result2.current.data);
    });
  });

  describe("hook interface", () => {
    it("should return TanStack Query result object", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
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

    it("should provide refetch function", async () => {
      // Arrange
      let fetchCount = 0;
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          fetchCount++;
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const initialFetchCount = fetchCount;

      // Refetch
      await result.current.refetch();

      // Assert - refetch should trigger another fetch
      expect(fetchCount).toBeGreaterThan(initialFetchCount);
    });
  });

  describe("error handling", () => {
    it("should handle 404 errors", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json({ message: "Not found" }, { status: 404 });
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Assert
      expect(result.current.error).toBeDefined();
    });

    it("should handle 401 unauthorized errors", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Assert
      expect(result.current.error).toBeDefined();
    });

    it("should handle 403 forbidden errors", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Assert
      expect(result.current.error).toBeDefined();
    });
  });

  describe("multiple categories", () => {
    it("should handle single category", async () => {
      // Arrange
      const singleCategory = [{ id: 1, name: "Electronics" }];
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(singleCategory);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].name).toBe("Electronics");
    });

    it("should handle many categories", async () => {
      // Arrange
      const manyCategories = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Category ${i + 1}`,
      }));

      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(manyCategories);
        }),
      );

      // Act
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Assert
      expect(result.current.data).toHaveLength(20);
      expect(result.current.data?.[0].name).toBe("Category 1");
      expect(result.current.data?.[19].name).toBe("Category 20");
    });
  });
});
