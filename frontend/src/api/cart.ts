import apiClient from "./client";
import type { CartItem } from "../types";

/**
 * Cart API module
 *
 * Provides functions for shopping cart operations:
 * - getAll: Retrieve all items in the user's cart
 * - add: Add a product to the cart
 * - updateQuantity: Update the quantity of a cart item
 * - remove: Remove an item from the cart
 */

/**
 * Request payload for adding an item to the cart
 */
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

/**
 * Request payload for updating cart item quantity
 */
export interface UpdateCartQuantityRequest {
  quantity: number;
}

/**
 * Response from remove cart item endpoint
 */
export interface RemoveCartItemResponse {
  message: string;
  cartItem: CartItem;
}

/**
 * Get all items in the user's cart
 *
 * Retrieves all cart items for the authenticated user.
 * Each cart item includes the associated product information.
 *
 * @returns Promise resolving to an array of cart items
 * @throws ApiError if the request fails or user is not authenticated
 *
 * @example
 * ```typescript
 * const cartItems = await cartApi.getAll();
 * console.log(`Cart has ${cartItems.length} items`);
 * ```
 */
export async function getAll(): Promise<CartItem[]> {
  const response = await apiClient.get<CartItem[]>("/api/cart");
  return response.data;
}

/**
 * Add a product to the cart
 *
 * Adds a new product to the user's cart with the specified quantity.
 * If the product already exists in the cart, the quantity will be updated.
 * Requires user authentication.
 *
 * @param productId - The product ID to add
 * @param quantity - The quantity to add
 * @returns Promise resolving to the created or updated cart item
 * @throws ApiError if addition fails, product not found, or user not authenticated
 *
 * @example
 * ```typescript
 * const cartItem = await cartApi.add(123, 2);
 * console.log(`Added ${cartItem.quantity} items to cart`);
 * ```
 */
export async function add(
  productId: number,
  quantity: number,
): Promise<CartItem> {
  const response = await apiClient.post<CartItem>("/api/cart", {
    product_id: productId,
    quantity,
  });
  return response.data;
}

/**
 * Update the quantity of a cart item
 *
 * Updates the quantity of an existing cart item.
 * Requires user authentication and ownership of the cart item.
 *
 * @param id - The cart item ID to update
 * @param quantity - The new quantity
 * @returns Promise resolving to the updated cart item
 * @throws ApiError if update fails, cart item not found, or user not authenticated
 *
 * @example
 * ```typescript
 * const updated = await cartApi.updateQuantity(456, 5);
 * console.log(`Updated quantity to ${updated.quantity}`);
 * ```
 */
export async function updateQuantity(
  id: number,
  quantity: number,
): Promise<CartItem> {
  const response = await apiClient.patch<CartItem>(`/api/cart/${id}`, {
    quantity,
  });
  return response.data;
}

/**
 * Remove an item from the cart
 *
 * Permanently removes a cart item from the user's cart.
 * Requires user authentication and ownership of the cart item.
 *
 * @param id - The cart item ID to remove
 * @returns Promise resolving to a success message and removed cart item data
 * @throws ApiError if removal fails, cart item not found, or user not authenticated
 *
 * @example
 * ```typescript
 * const result = await cartApi.remove(456);
 * console.log(result.message); // "Cart item removed successfully"
 * ```
 */
export async function remove(id: number): Promise<RemoveCartItemResponse> {
  const response = await apiClient.delete<RemoveCartItemResponse>(
    `/api/cart/${id}`,
  );
  return response.data;
}

/**
 * Cart API object
 * Provides a convenient namespace for all cart operations
 */
export const cartApi = {
  getAll,
  add,
  updateQuantity,
  remove,
};

export default cartApi;
