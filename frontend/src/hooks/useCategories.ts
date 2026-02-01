import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories";
import type { Category } from "../types";

/**
 * Custom hook for fetching all categories using TanStack Query
 *
 * This hook provides:
 * - Automatic caching of category data
 * - Background refetching to keep data fresh
 * - Loading and error states
 * - Automatic retry on failure
 *
 * Categories are typically stable data that doesn't change frequently,
 * so this hook uses a longer stale time to reduce unnecessary API calls.
 *
 * @returns Query result with categories data, loading state, and error state
 *
 * @example
 * ```typescript
 * const { data: categories, isLoading, error } = useCategories();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <CategoryFilter categories={categories} />
 * );
 * ```
 */
export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes (categories change infrequently)
    gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes (formerly cacheTime)
  });
}
