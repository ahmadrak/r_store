import React from "react";
import type { Order } from "../../types";

interface OrderCardProps {
  order: Order;
  onClick: (orderId: number) => void;
}

/**
 * OrderCardSkeleton component displays a loading skeleton for OrderCard
 */
export const OrderCardSkeleton: React.FC = () => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
      data-testid="order-card-skeleton"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <div className="h-4 bg-gray-300 rounded w-12 mb-2"></div>
          <div className="h-7 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  );
};

/**
 * OrderCard component displays a summary of an order
 * Shows order date, total price, and status
 * Clicking the card navigates to order details
 */
export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div
      onClick={() => onClick(order.id)}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
      data-testid="order-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.id}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(order.created_at)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            order.status,
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(order.total_price)}
          </p>
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
          View Details →
        </button>
      </div>
    </div>
  );
};
