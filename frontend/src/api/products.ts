import apiClient from "./client";
import type { Product } from "../types";

/**
 * Products API module
 *
 * Provides functions for product management operations:
 * - getAll: Retrieve all products
 * - getById: Retrieve a single product by ID
 * - create: Create a new product (admin only)
 * - update: Update an existing product (admin only)
 * - delete: Delete a product (admin only)
 * - addImages: Add images to a product (admin only)
 * - getImages: Retrieve all images for a product
 */

/**
 * Product image interface
 */
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_main: boolean;
}

/**
 * Extended product interface with images array
 * Used by getAll endpoint which includes images
 */
export interface ProductWithImages extends Omit<Product, "main_image_url"> {
  images: ProductImage[];
}

/**
 * Request payload for creating a product
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
}

/**
 * Request payload for updating a product
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: number;
}

/**
 * Request payload for adding a product image
 */
export interface AddProductImageRequest {
  image_url: string;
  is_main?: boolean;
}

/**
 * Response from delete product endpoint
 */
export interface DeleteProductResponse {
  message: string;
  product: Product;
}

/**
 * Get all products
 *
 * Retrieves all products from the catalog with their images.
 * Products include category information and all associated images.
 *
 * @returns Promise resolving to an array of products with images
 * @throws ApiError if the request fails
 *
 * @example
 * ```typescript
 * const products = await productsApi.getAll();
 * console.log(`Found ${products.length} products`);
 * ```
 */
export async function getAll(): Promise<ProductWithImages[]> {
  const response = await apiClient.get<ProductWithImages[]>("/api/products");
  return response.data;
}

/**
 * Get a single product by ID
 *
 * Retrieves detailed information for a specific product.
 * Note: The backend getAll endpoint returns all products, so this
 * function filters the results client-side. For a dedicated endpoint,
 * the backend would need to implement GET /api/products/:id
 *
 * @param id - The product ID
 * @returns Promise resolving to the product with images
 * @throws ApiError if the product is not found or request fails
 *
 * @example
 * ```typescript
 * const product = await productsApi.getById(123);
 * console.log(product.name, product.price);
 * ```
 */
export async function getById(id: number): Promise<ProductWithImages> {
  // Note: Backend doesn't have a dedicated GET /api/products/:id endpoint
  // We fetch all products and filter client-side
  // For better performance, consider adding a dedicated endpoint to the backend
  const products = await getAll();
  const product = products.find((p) => p.id === id);

  if (!product) {
    throw {
      response: {
        status: 404,
        data: { message: "Product not found" },
      },
    };
  }

  return product;
}

/**
 * Create a new product
 *
 * Creates a new product in the catalog. Requires admin privileges.
 * After creation, use addImages() to add product images.
 *
 * @param data - Product creation data
 * @returns Promise resolving to the created product
 * @throws ApiError if creation fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const product = await productsApi.create({
 *   name: "Wireless Mouse",
 *   description: "Ergonomic wireless mouse with USB receiver",
 *   price: 29.99,
 *   stock: 50,
 *   category_id: 2
 * });
 * ```
 */
export async function create(data: CreateProductRequest): Promise<Product> {
  const response = await apiClient.post<Product>("/api/products", data);
  return response.data;
}

/**
 * Update an existing product
 *
 * Updates one or more fields of an existing product. Requires admin privileges.
 * Only the fields provided in the data object will be updated.
 *
 * @param id - The product ID to update
 * @param data - Partial product data with fields to update
 * @returns Promise resolving to the updated product
 * @throws ApiError if update fails, product not found, or user lacks permissions
 *
 * @example
 * ```typescript
 * const updated = await productsApi.update(123, {
 *   price: 24.99,
 *   stock: 75
 * });
 * ```
 */
export async function update(
  id: number,
  data: UpdateProductRequest,
): Promise<Product> {
  const response = await apiClient.patch<Product>(`/api/products/${id}`, data);
  return response.data;
}

/**
 * Delete a product
 *
 * Permanently deletes a product from the catalog. Requires admin privileges.
 * This will also delete all associated images.
 *
 * @param id - The product ID to delete
 * @returns Promise resolving to a success message and deleted product data
 * @throws ApiError if deletion fails, product not found, or user lacks permissions
 *
 * @example
 * ```typescript
 * const result = await productsApi.delete(123);
 * console.log(result.message); // "Product deleted successfully"
 * ```
 */
export async function deleteProduct(
  id: number,
): Promise<DeleteProductResponse> {
  const response = await apiClient.delete<DeleteProductResponse>(
    `/api/products/${id}`,
  );
  return response.data;
}

/**
 * Add an image to a product
 *
 * Adds a new image to an existing product. Requires admin privileges.
 * Set is_main to true to make this the primary product image.
 *
 * @param productId - The product ID to add the image to
 * @param data - Image data including URL and main flag
 * @returns Promise resolving to the created image
 * @throws ApiError if creation fails or user lacks permissions
 *
 * @example
 * ```typescript
 * const image = await productsApi.addImages(123, {
 *   image_url: "https://example.com/images/product-123.jpg",
 *   is_main: true
 * });
 * ```
 */
export async function addImages(
  productId: number,
  data: AddProductImageRequest,
): Promise<ProductImage> {
  const response = await apiClient.post<ProductImage>(
    `/api/products/${productId}/images`,
    data,
  );
  return response.data;
}

/**
 * Get all images for a product
 *
 * Retrieves all images associated with a specific product.
 * Images include the main product image and any additional images.
 *
 * @param productId - The product ID to get images for
 * @returns Promise resolving to an array of product images
 * @throws ApiError if the request fails
 *
 * @example
 * ```typescript
 * const images = await productsApi.getImages(123);
 * const mainImage = images.find(img => img.is_main);
 * ```
 */
export async function getImages(productId: number): Promise<ProductImage[]> {
  const response = await apiClient.get<ProductImage[]>(
    `/api/products/${productId}/images`,
  );
  return response.data;
}

/**
 * Products API object
 * Provides a convenient namespace for all product operations
 */
export const productsApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteProduct,
  addImages,
  getImages,
};

export default productsApi;
