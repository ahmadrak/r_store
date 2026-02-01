import apiClient from "./client";
import type { Order, OrderWithItems } from "../types/order.types";

/**
 * Orders API module
 * Provides functions for interacting with order endpoints
 */
export const ordersApi = {
  /**
   * Get all orders for the current user
   * @returns Promise<Order[]> Array of orders
   */
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get("/api/orders");
    return response.data;
  },

  /**
   * Get a single order by ID with items
   * @param id Order ID
   * @returns Promise<OrderWithItems> Order with items
   */
  getById: async (id: number): Promise<OrderWithItems> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  /**
   * Create a new order
   * @param items Array of order items with product_id, quantity, and price
   * @returns Promise<Order> Created order
   */
  create: async (
    items: Array<{ product_id: number; quantity: number; price: number }>,
  ): Promise<Order> => {
    const response = await apiClient.post("/api/orders", { items });
    return response.data;
  },

  /**
   * Update order status (admin only)
   * @param id Order ID
   * @param status New order status
   * @returns Promise<Order> Updated order
   */
  updateStatus: async (
    id: number,
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  ): Promise<Order> => {
    const response = await apiClient.patch(`/api/orders/${id}`, { status });
    return response.data;
  },

  /**
   * Delete an order (admin only)
   * @param id Order ID
   * @returns Promise<void>
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/orders/${id}`);
  },
};
