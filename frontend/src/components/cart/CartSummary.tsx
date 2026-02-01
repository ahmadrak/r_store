import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import Button from "../common/Button";

const CartSummary: React.FC = () => {
  const { itemCount, totalPrice, items } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const subtotal = totalPrice;
  const total = totalPrice;

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Items Count */}
      <div className="flex justify-between mb-2">
        <span className="text-gray-600">
          Items ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between mb-2">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 my-4"></div>

      {/* Total */}
      <div className="flex justify-between mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="w-full"
      >
        Proceed to Checkout
      </Button>

      {/* Additional Info */}
      {items.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Add items to your cart to checkout
        </p>
      )}
    </div>
  );
};

export default CartSummary;
