import fc from "fast-check";
import type { User, Product, CartItem, Order } from "../../types";

export const userArb: fc.Arbitrary<User> = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  role: fc.constantFrom("user" as const, "admin" as const),
});

export const productArb: fc.Arbitrary<Product> = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ maxLength: 1000 }),
  price: fc.float({ min: 0.01, max: 10000, noNaN: true }),
  stock: fc.nat({ max: 1000 }),
  category_id: fc.nat(),
  main_image_url: fc.option(fc.webUrl(), { nil: null }),
  created_at: fc.date().map((d) => d.toISOString()),
});

export const cartItemArb: fc.Arbitrary<CartItem> = fc.record({
  id: fc.nat(),
  product_id: fc.nat(),
  quantity: fc.integer({ min: 1, max: 99 }),
  created_at: fc.date().map((d) => d.toISOString()),
});

export const cartItemWithProductArb: fc.Arbitrary<CartItem> = fc
  .tuple(cartItemArb, productArb)
  .map(([item, product]) => ({
    ...item,
    product_id: product.id,
    product,
  }));

export const orderArb: fc.Arbitrary<Order> = fc.record({
  id: fc.nat(),
  user_id: fc.nat(),
  total_price: fc.float({ min: 0.01, max: 100000, noNaN: true }),
  status: fc.constantFrom(
    "pending" as const,
    "processing" as const,
    "shipped" as const,
    "delivered" as const,
    "cancelled" as const,
  ),
  created_at: fc.date().map((d) => d.toISOString()),
});

export const categoryArb = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
});

export const credentialsArb = fc.record({
  email: fc.emailAddress(),
  password: fc.string({ minLength: 6, maxLength: 100 }),
});

export const registrationDataArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  password: fc.string({ minLength: 6, maxLength: 100 }),
});

// HTTP Status Code Arbitraries

export const clientErrorStatusArb = fc.constantFrom(400, 401, 403, 404, 409);

export const serverErrorStatusArb = fc.constantFrom(500, 502, 503, 504);

export const errorStatusArb = fc.oneof(
  clientErrorStatusArb,
  serverErrorStatusArb,
);

export const successStatusArb = fc.constantFrom(200, 201, 204);
