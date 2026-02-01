import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../../api/orders";
import type { Order } from "../../types";
import { OrderTable } from "../../components/admin/OrderTable";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * AdminOrders Page
 *
 * Admin page for managing all orders in the system.
 * Provides functionality to view orders, update status, and delete orders.
 *
 * Features:
 * - Display all orders in a table
 * - Update order status with dropdown
 * - Delete orders with confirmation dialog
 * - View order details link
 * - Success notifications for all operations
 * - Loading and error states
 * - Automatic data refresh after mutations
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  // Fetch all orders
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", "admin"],
    queryFn: () => ordersApi.getAll(),
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order["status"] }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSuccess("Order status updated successfully");
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.message || "Failed to update order status",
      );
    },
  });

  // Delete order mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSuccess("Order deleted successfully");
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to delete order");
    },
  });

  // Handle status update
  const handleStatusUpdate = (orderId: number, status: Order["status"]) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  // Handle delete
  const handleDelete = (orderId: number) => {
    deleteMutation.mutate(orderId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load orders. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const isOperationLoading =
    updateStatusMutation.isPending || deleteMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
        <p className="text-gray-600 mt-2">
          View and manage all customer orders
        </p>
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        loading={isOperationLoading}
      />
    </div>
  );
};

export default AdminOrders;
