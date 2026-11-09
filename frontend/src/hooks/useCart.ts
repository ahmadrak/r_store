/**
 * useCart Hook
 *
 * Custom hook to access cart context.
 * Re-exported from CartContext for convenient importing.
 *
 * This hook provides access to:
 * - Current cart items with product details
 * - Cart item count and total price
 * - Loading state for cart operations
 * - Cart operations (add, update, remove, clear, refresh)
 *
 * @throws Error if used outside of CartProvider
 *
 * @example
 * ```tsx
 * import { useCart } from '../hooks/useCart';
 *
 * function MyComponent() {
 *   const { items, itemCount, totalPrice, addItem } = useCart();
 *
 *   return (
 *     <div>
 *       <p>Cart: {itemCount} items (${totalPrice.toFixed(2)})</p>
 *       <button onClick={() => addItem(123, 1)}>Add Product</button>
 *     </div>
 *   );
 * ```
 */

export { useCart } from "../contexts/CartContext";
export type { CartContextType } from "../contexts/CartContext";
