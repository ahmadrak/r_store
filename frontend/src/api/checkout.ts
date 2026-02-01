import apiClient from "./client";

/**
 * Checkout API module
 *
 * Provides functions for checkout operations:
 * - createSession: Create a Stripe checkout session
 */

/**
 * Response from create checkout session endpoint
 */
export interface CreateCheckoutSessionResponse {
  url: string;
}

/**
 * Create a Stripe checkout session
 *
 * Creates a new Stripe checkout session for the user's cart.
 * The backend will validate that the cart is not empty and create
 * a Stripe session with all cart items as line items.
 * Requires user authentication.
 *
 * @returns Promise resolving to the checkout session URL
 * @throws ApiError if session creation fails, cart is empty, or user not authenticated
 *
 * @example
 * ```typescript
 * const { url } = await checkoutApi.createSession();
 * window.location.href = url; // Redirect to Stripe checkout
 * ```
 */
export async function createSession(): Promise<CreateCheckoutSessionResponse> {
  const response = await apiClient.post<CreateCheckoutSessionResponse>(
    "/api/checkout/create-session",
  );
  return response.data;
}

/**
 * Checkout API object
 * Provides a convenient namespace for all checkout operations
 */
export const checkoutApi = {
  createSession,
};

export default checkoutApi;
