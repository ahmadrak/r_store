import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";
import type { ProductWithImages } from "../api/products";

/**
 * Custom hook for fetching all products using TanStack Query
 *
 * This hook provides:
 * - Automatic caching of product data
 * - Background refetching to keep data fresh
 * - Loading and error states
 * - Automatic retry on failure
 *
 * @param categoryId - Optional category ID to filter products by
 * @returns Query result with products data, loading state, and error state
 *
 * @example
 * ```typescript
 * // Fetch all products
 * const { data: products, isLoading, error } = useProducts();
 *
 * // Fetch products for a specific category
 * const { data: products } = useProducts(2);
 * ```
 */
export function useProducts(categoryId?: number) {
  return useQuery<ProductWithImages[], Error>({
    queryKey: ["products", categoryId],
    queryFn: async () => {
      const products = await productsApi.getAll();

      // Filter by category if categoryId is provided
      if (categoryId !== undefined) {
        return products.filter((product) => product.category_id === categoryId);
      }

      return products;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (formerly cacheTime)
  });
}
