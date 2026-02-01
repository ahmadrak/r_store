import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../types";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

/**
 * OrderTable Props
 */
export interface OrderTableProps {
  /** Array of orders to display */
  orders: Order[];
  /** Callback when status is updated */
  onStatusUpdate: (orderId: number, status: Order["status"]) => void;
  /** Callback when delete is confirmed */
  onDelete: (orderId: number) => void;
  /** Whether any operation is in progress */
  loading?: boolean;
}

/**
 * OrderTable Component
 *
 * A table component for displaying and managing orders in the admin panel.
 * Provides status update dropdown, delete action with confirmation, and view details link.
 *
 * Features:
 * - Display order ID, customer, total, status, and date
 * - Status update dropdown for each order
 * - Delete action button with confirmation dialog
 * - View details link to order detail page
 * - Responsive table layout
 * - Loading state support
 * - Empty state message
 * - Accessible with proper ARIA attributes
 *
 * Requirements: 8.1, 8.2, 8.4, 8.5
 *
 * @example
 * ```tsx
 * <OrderTable
 *   orders={orders}
 *   onStatusUpdate={(id, status) => handleStatusUpdate(id, status)}
 *   onDelete={(id) => handleDelete(id)}
 *   loading={isUpdating}
 * />
 * ```
 */
export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onStatusUpdate,
  onDelete,
  loading = false,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Handle status change
  const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
    onStatusUpdate(orderId, newStatus);
  };

  // Handle delete button click
  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      onDelete(orderToDelete.id);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
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

  // Empty state
  if (orders.length === 0) {
    return (
      <div
        className="text-center py-12 bg-gray-50 rounded-lg"
        data-testid="order-table-empty"
      >
        <p className="text-gray-600">No orders found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto" data-testid="order-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Order ID Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order ID
              </th>

              {/* Customer Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>

              {/* Total Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>

              {/* Status Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>

              {/* Date Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>

              {/* Actions Column */}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50"
                data-testid={`order-row-${order.id}`}
              >
                {/* Order ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order.id}
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.user?.name || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.user?.email || ""}
                  </div>
                </td>

                {/* Total */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${order.total_price.toFixed(2)}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as Order["status"],
                      )
                    }
                    disabled={loading}
                    className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    data-testid={`status-select-${order.id}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(order.created_at)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      data-testid={`view-order-${order.id}`}
                    >
                      View Details
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(order)}
                      disabled={loading}
                      data-testid={`delete-order-${order.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Confirm Delete"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
              disabled={loading}
              data-testid="delete-cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={loading}
              data-testid="delete-confirm-button"
            >
              Delete
            </Button>
          </>
        }
        data-testid="delete-confirmation-modal"
      >
        <p className="text-gray-700">
          Are you sure you want to delete order{" "}
          <span className="font-semibold">#{orderToDelete?.id}</span>? This
          action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default OrderTable;
