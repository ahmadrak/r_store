import apiClient from "./client";
import type { Category } from "../types";

/**
 * Categories API module
 *
 * Provides functions for category management operations:
 * - getAll: Retrieve all categories
 * - create: Create a new category (admin only)
 * - update: Update an existing category (admin only)
 * - delete: Delete a category (admin only)
 */

/**
 * Request payload for creating a category
 */
export interface CreateCategoryRequest {
  name: string;
}

/**
 * Request payload for updating a category
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateCategoryRequest {
  name?: string;
}

/**
 * Response from delete category endpoint
 */
export interface DeleteCategoryResponse {
  message: string;
  category: Category;
}

/**
 * Get all categories
 *
 * Retrieves all categories from the system.
 * Categories are used to organize products into logical groups.
 *
 * @returns Promise resolving to an array of categories
 * @throws ApiError if the request fails
 *
 * @example
 * ```typescript
 * const categories = await categoriesApi.getAll();
 * console.log(`Found ${categories.length} categories`);
 * ```
 */
export async function getAll(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/api/categories");
  return response.data;
}

/**
 * Create a new category
 *
 * Creates a new category in the system. Requires admin privileges.
 * Categories are used to organize products.
 *
 * @param data - Category creation data
 * @returns Promise resolving to the created category
 * @throws ApiError if creation fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const category = await categoriesApi.create({
 *   name: "Electronics"
 * });
 * ```
 */
export async function create(data: CreateCategoryRequest): Promise<Category> {
  const response = await apiClient.post<Category>("/api/categories", data);
  return response.data;
}

/**
 * Update an existing category
 *
 * Updates one or more fields of an existing category. Requires admin privileges.
 * Only the fields provided in the data object will be updated.
 *
 * @param id - The category ID to update
 * @param data - Partial category data with fields to update
 * @returns Promise resolving to the updated category
 * @throws ApiError if update fails, category not found, or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await categoriesApi.update(1, {
 *   name: "Consumer Electronics"
 * });
 * ```
 */
export async function update(
  id: number,
  data: UpdateCategoryRequest,
): Promise<Category> {
  const response = await apiClient.patch<Category>(
    `/api/categories/${id}`,
    data,
  );
  return response.data;
}

/**
 * Delete a category
 *
 * Permanently deletes a category from the system. Requires admin privileges.
 * Note: This may fail if products are still associated with this category.
 *
 * @param id - The category ID to delete
 * @returns Promise resolving to a success message and deleted category data
 * @throws ApiError if deletion fails, category not found, or user lacks permissions
 *
 * @example
 * ```typescript
 * const result = await categoriesApi.delete(1);
 * console.log(result.message); // "Category deleted successfully"
 * ```
 */
export async function deleteCategory(
  id: number,
): Promise<DeleteCategoryResponse> {
  const response = await apiClient.delete<DeleteCategoryResponse>(
    `/api/categories/${id}`,
  );
  return response.data;
}

/**
 * Categories API object
 * Provides a convenient namespace for all category operations
 */
export const categoriesApi = {
  getAll,
  create,
  update,
  delete: deleteCategory,
};

export default categoriesApi;
