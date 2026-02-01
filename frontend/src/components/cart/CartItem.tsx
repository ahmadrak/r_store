import React from "react";
import type { CartItem as CartItemType } from "../../types";
import { useCart } from "../../hooks/useCart";
import { useNotification } from "../../contexts/NotificationContext";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { showError, showSuccess } = useNotification();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const product = item.product;

  const handleIncrement = async () => {
    if (!product || isUpdating) return;

    // Check if we can add more (stock limit)
    if (item.quantity >= product.stock) {
      showError(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, item.quantity + 1);
    } catch (error) {
      showError("Failed to update quantity");
      console.error("Failed to increment quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (isUpdating) return;

    if (item.quantity <= 1) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, item.quantity - 1);
    } catch (error) {
      showError("Failed to update quantity");
      console.error("Failed to decrement quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await removeItem(item.id);
      showSuccess("Item removed from cart");
    } catch (error) {
      showError("Failed to remove item");
      console.error("Failed to remove item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const subtotal = product ? product.price * item.quantity : 0;

  if (!product) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="text-gray-500">Product information unavailable</div>
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-200 transition-all duration-200 hover:bg-gray-50">
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-24">
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded transition-transform duration-200 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600">${product.price.toFixed(2)}</p>
        {product.category && (
          <p className="text-sm text-gray-500">{product.category.name}</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={isUpdating || item.quantity <= 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        <button
          onClick={handleIncrement}
          disabled={isUpdating || item.quantity >= product.stock}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="w-24 text-right">
        <p className="text-lg font-semibold text-gray-900">
          ${subtotal.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2 transition-all duration-200 hover:scale-110"
        aria-label="Remove item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default CartItem;
