import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useNotification } from "../contexts/NotificationContext";
import { checkoutApi } from "../api/checkout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";

/**
 * Checkout Page Component
 *
 * Handles the checkout flow:
 * - Validates user is authenticated
 * - Validates cart is not empty
 * - Creates Stripe checkout session
 * - Redirects to Stripe hosted checkout
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, itemCount, totalPrice, isLoading: cartLoading } = useCart();
  const { showError, showInfo } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect unauthenticated users to login (Requirement 4.5)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showInfo("Please sign in to continue with checkout");
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [isAuthenticated, authLoading, navigate, showInfo]);

  // Validate cart is not empty (Requirement 4.6)
  useEffect(() => {
    if (!cartLoading && isAuthenticated && itemCount === 0) {
      showError("Your cart is empty. Please add items before checking out.");
      navigate("/cart");
    }
  }, [itemCount, cartLoading, isAuthenticated, navigate, showError]);

  /**
   * Handle checkout button click
   * Creates Stripe checkout session and redirects to Stripe
   * Requirements: 4.1, 4.2
   */
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      // Create checkout session (Requirement 4.1)
      const { url } = await checkoutApi.createSession();

      // Redirect to Stripe checkout (Requirement 4.2)
      window.location.href = url;
    } catch (error: any) {
      setIsProcessing(false);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to initiate checkout. Please try again.";
      showError(errorMessage);
    }
  };

  // Show loading spinner while checking auth and cart
  if (authLoading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render if not authenticated or cart is empty (will redirect)
  if (!isAuthenticated || itemCount === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{item.product?.name}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600">Items ({itemCount})</p>
            <p className="font-medium">${totalPrice.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <p>Total</p>
            <p>${totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Checkout Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          You will be redirected to Stripe to complete your payment securely.
        </p>
      </div>

      {/* Checkout Button */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/cart")}
          disabled={isProcessing}
          className="flex-1"
        >
          Back to Cart
        </Button>
        <Button
          variant="primary"
          onClick={handleCheckout}
          disabled={isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? "Processing..." : "Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
