// Order-related types
export interface Order {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  total_price: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    main_image_url: string | null;
    created_at: string;
  };
  quantity: number;
  price_at_time: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
