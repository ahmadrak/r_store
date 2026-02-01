import { z } from "zod";

// TypeScript Interfaces

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category?: Category;
  main_image_url: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  user?: User;
  total_price: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price_at_time: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Export as type alias for better module compatibility
export type OrderWithItemsType = OrderWithItems;

export interface ApiError {
  message: string;
  status: number;
}

// Zod Validation Schemas

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category_id: z.number(),
  category: CategorySchema.optional(),
  main_image_url: z.string().nullable(),
  created_at: z.string(),
});

export const CartItemSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  product: ProductSchema.optional(),
  quantity: z.number().int().positive(),
  created_at: z.string(),
});

export const OrderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  total_price: z.number().positive(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  created_at: z.string(),
});

export const OrderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  product: ProductSchema.optional(),
  quantity: z.number().int().positive(),
  price_at_time: z.number().positive(),
});

export const OrderWithItemsSchema = OrderSchema.extend({
  items: z.array(OrderItemSchema),
});

export const ApiErrorSchema = z.object({
  message: z.string(),
  status: z.number(),
});

// Type Inference from Zod Schemas
export type UserType = z.infer<typeof UserSchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type CategoryType = z.infer<typeof CategorySchema>;
export type CartItemType = z.infer<typeof CartItemSchema>;
export type OrderType = z.infer<typeof OrderSchema>;
export type OrderItemType = z.infer<typeof OrderItemSchema>;
export type ApiErrorType = z.infer<typeof ApiErrorSchema>;
