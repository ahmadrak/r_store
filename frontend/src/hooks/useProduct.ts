import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";
import type { ProductWithImages } from "../api/products";

/**
 * Custom hook for fetching a single product by ID using TanStack Query
 *
 * This hook provides:
 * - Automatic caching of product data
 * - Background refetching to keep data fresh
 * - Loading and error states
 * - Automatic retry on failure
 *
 * @param id - The product ID to fetch
 * @returns Query result with product data, loading state, and error state
 *
 * @example
 * ```typescript
 * const { data: product, isLoading, error } = useProduct(123);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!product) return <NotFound />;
 *
 * return <ProductDetail product={product} />;
 * ```
 */
export function useProduct(id: number) {
  return useQuery<ProductWithImages, Error>({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (formerly cacheTime)
    enabled: !!id, // Only run query if id is truthy
  });
}
