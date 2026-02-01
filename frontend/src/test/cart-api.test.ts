import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cartApi } from "../api/cart";
import type { CartItem } from "../types";

/**
 * Unit tests for cart API endpoints
 *
 * Tests verify that:
 * - API functions send requests to correct endpoints
 * - Request payloads are properly formatted
 * - Response data is correctly parsed
 * - Error handling works as expected
 */

// Mock cart item data for testing
const mockCartItem: CartItem = {
  id: 1,
  product_id: 123,
  product: {
    id: 123,
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    stock: 100,
    category_id: 1,
    main_image_url: "https://example.com/image.jpg",
    created_at: "2024-01-01T00:00:00.000Z",
  },
  quantity: 2,
  created_at: "2024-01-15T10:00:00.000Z",
};

// Setup MSW server for API mocking
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Cart API", () => {
  describe("getAll", () => {
    it("should send GET request to /api/cart", async () => {
      // Arrange
      const mockCartItems = [mockCartItem];

      server.use(
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(mockCartItems);
        }),
      );

      // Act
      const result = await cartApi.getAll();

      // Assert
      expect(result).toEqual(mockCartItems);
      expect(result).toHaveLength(1);
      expect(result[0].product_id).toBe(123);
      expect(result[0].quantity).toBe(2);
    });

    it("should return empty array when cart is empty", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act
      const result = await cartApi.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should include product details in cart items", async () => {
      // Arrange
      const mockCartItems = [mockCartItem];

      server.use(
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(mockCartItems);
        }),
      );

      // Act
      const result = await cartApi.getAll();

      // Assert
      expect(result[0].product).toBeDefined();
      expect(result[0].product?.name).toBe("Test Product");
      expect(result[0].product?.price).toBe(29.99);
    });

    it("should throw ApiError when user is not authenticated", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.getAll()).rejects.toMatchObject({
        message: "Not authenticated",
        status: 401,
      });
    });

    it("should throw ApiError when request fails", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Database connection failed" },
            { status: 500 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.getAll()).rejects.toMatchObject({
        message: "Database connection failed",
        status: 500,
      });
    });
  });

  describe("add", () => {
    it("should send POST request to /api/cart with product_id and quantity", async () => {
      // Arrange
      const productId = 123;
      const quantity = 3;

      server.use(
        http.post("http://localhost:5000/api/cart", async ({ request }) => {
          const body = (await request.json()) as any;

          // Verify request payload
          expect(body.product_id).toBe(productId);
          expect(body.quantity).toBe(quantity);

          return HttpResponse.json(
            {
              id: 2,
              product_id: body.product_id,
              quantity: body.quantity,
              created_at: "2024-01-15T11:00:00.000Z",
            },
            { status: 201 },
          );
        }),
      );

      // Act
      const result = await cartApi.add(productId, quantity);

      // Assert
      expect(result).toBeDefined();
      expect(result.product_id).toBe(productId);
      expect(result.quantity).toBe(quantity);
    });

    it("should handle adding item with quantity 1", async () => {
      // Arrange
      const productId = 456;
      const quantity = 1;

      server.use(
        http.post("http://localhost:5000/api/cart", async ({ request }) => {
          const body = (await request.json()) as any;

          return HttpResponse.json(
            {
              id: 3,
              product_id: body.product_id,
              quantity: body.quantity,
              created_at: "2024-01-15T11:00:00.000Z",
            },
            { status: 201 },
          );
        }),
      );

      // Act
      const result = await cartApi.add(productId, quantity);

      // Assert
      expect(result.quantity).toBe(1);
    });

    it("should throw ApiError when product not found", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Product not found" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.add(999, 1)).rejects.toMatchObject({
        message: "Product not found",
        status: 404,
      });
    });

    it("should throw ApiError when quantity is invalid", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Quantity must be a positive integer" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.add(123, 0)).rejects.toMatchObject({
        message: "Quantity must be a positive integer",
        status: 400,
      });
    });

    it("should throw ApiError when user is not authenticated", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.add(123, 1)).rejects.toMatchObject({
        message: "Not authenticated",
        status: 401,
      });
    });

    it("should throw ApiError when product is out of stock", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Insufficient stock" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.add(123, 1000)).rejects.toMatchObject({
        message: "Insufficient stock",
        status: 400,
      });
    });
  });

  describe("updateQuantity", () => {
    it("should send PATCH request to /api/cart/:id with new quantity", async () => {
      // Arrange
      const cartItemId = 1;
      const newQuantity = 5;

      server.use(
        http.patch("http://localhost:5000/api/cart/1", async ({ request }) => {
          const body = (await request.json()) as any;

          // Verify request payload
          expect(body.quantity).toBe(newQuantity);

          return HttpResponse.json({
            ...mockCartItem,
            quantity: body.quantity,
          });
        }),
      );

      // Act
      const result = await cartApi.updateQuantity(cartItemId, newQuantity);

      // Assert
      expect(result).toBeDefined();
      expect(result.quantity).toBe(newQuantity);
      expect(result.id).toBe(1);
    });

    it("should handle updating quantity to 1", async () => {
      // Arrange
      const cartItemId = 1;
      const newQuantity = 1;

      server.use(
        http.patch("http://localhost:5000/api/cart/1", async ({ request }) => {
          const body = (await request.json()) as any;

          return HttpResponse.json({
            ...mockCartItem,
            quantity: body.quantity,
          });
        }),
      );

      // Act
      const result = await cartApi.updateQuantity(cartItemId, newQuantity);

      // Assert
      expect(result.quantity).toBe(1);
    });

    it("should throw ApiError when cart item not found", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/cart/999", () => {
          return HttpResponse.json(
            { message: "Cart item not found" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.updateQuantity(999, 5)).rejects.toMatchObject({
        message: "Cart item not found",
        status: 404,
      });
    });

    it("should throw ApiError when quantity is invalid", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/cart/1", () => {
          return HttpResponse.json(
            { message: "Quantity must be a positive integer" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.updateQuantity(1, 0)).rejects.toMatchObject({
        message: "Quantity must be a positive integer",
        status: 400,
      });
    });

    it("should throw ApiError when user is not authenticated", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/cart/1", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.updateQuantity(1, 5)).rejects.toMatchObject({
        message: "Not authenticated",
        status: 401,
      });
    });

    it("should throw ApiError when exceeding available stock", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/cart/1", () => {
          return HttpResponse.json(
            { message: "Insufficient stock" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.updateQuantity(1, 1000)).rejects.toMatchObject({
        message: "Insufficient stock",
        status: 400,
      });
    });
  });

  describe("remove", () => {
    it("should send DELETE request to /api/cart/:id", async () => {
      // Arrange
      let deleteCalled = false;

      server.use(
        http.delete("http://localhost:5000/api/cart/1", () => {
          deleteCalled = true;
          return HttpResponse.json({
            message: "Cart item removed successfully",
            cartItem: mockCartItem,
          });
        }),
      );

      // Act
      const result = await cartApi.remove(1);

      // Assert
      expect(deleteCalled).toBe(true);
      expect(result.message).toBe("Cart item removed successfully");
      expect(result.cartItem).toEqual(mockCartItem);
    });

    it("should throw ApiError when cart item not found", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/cart/999", () => {
          return HttpResponse.json(
            { message: "Cart item not found" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.remove(999)).rejects.toMatchObject({
        message: "Cart item not found",
        status: 404,
      });
    });

    it("should throw ApiError when user is not authenticated", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/cart/1", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act & Assert
      await expect(cartApi.remove(1)).rejects.toMatchObject({
        message: "Not authenticated",
        status: 401,
      });
    });

    it("should throw ApiError when user does not own the cart item", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/cart/1", () => {
          return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
        }),
      );

      // Act & Assert
      await expect(cartApi.remove(1)).rejects.toMatchObject({
        message: "Forbidden",
        status: 403,
      });
    });
  });

  describe("API endpoint structure", () => {
    it("should export all required functions", () => {
      expect(cartApi.getAll).toBeDefined();
      expect(cartApi.add).toBeDefined();
      expect(cartApi.updateQuantity).toBeDefined();
      expect(cartApi.remove).toBeDefined();
    });

    it("should have correct function signatures", () => {
      expect(typeof cartApi.getAll).toBe("function");
      expect(typeof cartApi.add).toBe("function");
      expect(typeof cartApi.updateQuantity).toBe("function");
      expect(typeof cartApi.remove).toBe("function");
    });
  });
});
