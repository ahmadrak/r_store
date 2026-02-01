import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersApi } from "../api/orders";
import type { OrderWithItems } from "../types/order.types";
import { OrderDetail as OrderDetailComponent } from "../components/order/OrderDetail";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder(parseInt(id, 10));
    }
  }, [id]);

  const loadOrder = async (orderId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Order not found.");
      } else {
        setError("Failed to load order details. Please try again later.");
      }
      console.error("Error loading order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
        >
          ← Back to Orders
        </button>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
        >
          ← Back to Orders
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/orders")}
        className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
      >
        ← Back to Orders
      </button>
      <OrderDetailComponent order={order} />
    </div>
  );
};

export default OrderDetail;
