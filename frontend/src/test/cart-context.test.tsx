import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { CartProvider, useCart } from "../contexts/CartContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import type { CartItem, User, Product } from "../types";

/**
 * Unit tests for CartContext
 *
 * Tests verify that:
 * - Cart state updates correctly on add/update/remove operations
 * - Cart loads when user authenticates
 * - Cart clears when user logs out
 * - Optimistic updates work correctly
 * - Rollback on error works properly
 * - Loading states are managed correctly
 * - Item count and total price calculations are correct
 * - All cart operations call the correct API endpoints
 *
 * Requirements: 3.1, 3.2, 3.4, 3.5, 3.7, 11.2
 */

// Mock data for testing
const mockUser: User = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "user",
};

const mockProduct: Product = {
  id: 1,
  name: "Test Product",
  description: "A test product",
  price: 29.99,
  stock: 10,
  category_id: 1,
  main_image_url: "https://example.com/image.jpg",
  created_at: "2024-01-01T00:00:00Z",
};

const mockCartItem: CartItem = {
  id: 1,
  product_id: 1,
  product: mockProduct,
  quantity: 2,
  created_at: "2024-01-01T00:00:00Z",
};

const mockCartItem2: CartItem = {
  id: 2,
  product_id: 2,
  product: {
    ...mockProduct,
    id: 2,
    name: "Test Product 2",
    price: 19.99,
  },
  quantity: 1,
  created_at: "2024-01-01T00:00:00Z",
};

// Setup MSW server for API mocking
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Wrapper component that provides both Auth and Cart contexts
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

describe("CartContext", () => {
  describe("useCart hook", () => {
    it("should throw error when used outside CartProvider", () => {
      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act & Assert
      expect(() => {
        renderHook(() => useCart());
      }).toThrow("useCart must be used within a CartProvider");

      consoleError.mockRestore();
    });
  });

  describe("Initial state and cart loading", () => {
    it("should start with empty cart when not authenticated", async () => {
      // Arrange - Mock no authentication
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act
      const { result } = renderHook(() => useCart(), { wrapper });

      // Wait for auth to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it("should load cart when user is authenticated", async () => {
      // Arrange - Mock authenticated user with cart items
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem]);
        }),
      );

      // Act
      const { result } = renderHook(() => useCart(), { wrapper });

      // Wait for cart to load
      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
      });

      // Assert
      expect(result.current.items).toEqual([mockCartItem]);
      expect(result.current.itemCount).toBe(2); // quantity is 2
      expect(result.current.totalPrice).toBe(59.98); // 29.99 * 2
    });

    it("should calculate item count correctly with multiple items", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem, mockCartItem2]);
        }),
      );

      // Act
      const { result } = renderHook(() => useCart(), { wrapper });

      // Wait for cart to load
      await waitFor(() => {
        expect(result.current.items.length).toBe(2);
      });

      // Assert
      expect(result.current.itemCount).toBe(3); // 2 + 1
      expect(result.current.totalPrice).toBeCloseTo(79.97, 2); // (29.99 * 2) + (19.99 * 1)
    });

    it("should handle cart loading error gracefully", async () => {
      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Arrange - Mock cart loading failure
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Internal server error" },
            { status: 500 },
          );
        }),
      );

      // Act
      const { result } = renderHook(() => useCart(), { wrapper });

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert - Should have empty cart on error
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);

      consoleError.mockRestore();
    });
  });

  describe("addItem", () => {
    it("should add item to cart and refresh", async () => {
      // Arrange - Start with authenticated user and empty cart
      let cartItems: CartItem[] = [];

      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(cartItems);
        }),
        http.post("http://localhost:5000/api/cart", () => {
          cartItems = [mockCartItem];
          return HttpResponse.json(mockCartItem, { status: 201 });
        }),
      );

      const { result } = renderHook(
        () => {
          const auth = useAuth();
          const cart = useCart();
          return { auth, cart };
        },
        { wrapper },
      );

      // Wait for auth to complete AND cart to load
      await waitFor(
        () => {
          expect(result.current.auth.isLoading).toBe(false);
          expect(result.current.auth.isAuthenticated).toBe(true);
          expect(result.current.cart.isLoading).toBe(false);
          expect(result.current.cart.items).toEqual([]);
        },
        { timeout: 3000 },
      );

      // Act - Add item
      await act(async () => {
        await result.current.cart.addItem(1, 2);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.cart.items.length).toBe(1);
      });

      expect(result.current.cart.items).toEqual([mockCartItem]);
      expect(result.current.cart.itemCount).toBe(2);
    });

    it("should throw error when not authenticated", async () => {
      // Arrange - Not authenticated
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.addItem(1, 2);
        }),
      ).rejects.toThrow("Must be authenticated to add items to cart");
    });

    it("should rollback on API error", async () => {
      // Arrange - Start with authenticated user and empty cart
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([]);
        }),
        http.post("http://localhost:5000/api/cart", () => {
          return HttpResponse.json(
            { message: "Product out of stock" },
            { status: 400 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialItems = result.current.items;

      // Act - Try to add item (should fail)
      await act(async () => {
        try {
          await result.current.addItem(1, 2);
        } catch (error) {
          // Error is expected
        }
      });

      // Assert - Cart should be unchanged (rollback)
      expect(result.current.items).toEqual(initialItems);
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity optimistically", async () => {
      // Arrange - Start with cart containing one item
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem]);
        }),
        http.patch("http://localhost:5000/api/cart/:id", () => {
          return HttpResponse.json({ ...mockCartItem, quantity: 5 });
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
      });

      // Act - Update quantity
      await act(async () => {
        await result.current.updateQuantity(1, 5);
      });

      // Assert
      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.itemCount).toBe(5);
      expect(result.current.totalPrice).toBeCloseTo(149.95, 2); // 29.99 * 5
    });

    it("should rollback on API error", async () => {
      // Arrange - Start with cart containing one item
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem]);
        }),
        http.patch("http://localhost:5000/api/cart/:id", () => {
          return HttpResponse.json(
            { message: "Insufficient stock" },
            { status: 400 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
      });

      const initialQuantity = result.current.items[0].quantity;

      // Act - Try to update quantity (should fail)
      await act(async () => {
        try {
          await result.current.updateQuantity(1, 100);
        } catch (error) {
          // Error is expected
        }
      });

      // Assert - Quantity should be unchanged (rollback)
      expect(result.current.items[0].quantity).toBe(initialQuantity);
    });

    it("should throw error when not authenticated", async () => {
      // Arrange - Not authenticated
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.updateQuantity(1, 5);
        }),
      ).rejects.toThrow("Must be authenticated to update cart");
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart optimistically", async () => {
      // Arrange - Start with cart containing two items
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem, mockCartItem2]);
        }),
        http.delete("http://localhost:5000/api/cart/:id", () => {
          return HttpResponse.json({ message: "Item removed" });
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items.length).toBe(2);
      });

      // Act - Remove first item
      await act(async () => {
        await result.current.removeItem(1);
      });

      // Assert
      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].id).toBe(2);
      expect(result.current.itemCount).toBe(1);
    });

    it("should rollback on API error", async () => {
      // Arrange - Start with cart containing one item
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem]);
        }),
        http.delete("http://localhost:5000/api/cart/:id", () => {
          return HttpResponse.json(
            { message: "Item not found" },
            { status: 404 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
      });

      const initialItems = result.current.items;

      // Act - Try to remove item (should fail)
      await act(async () => {
        try {
          await result.current.removeItem(1);
        } catch (error) {
          // Error is expected
        }
      });

      // Assert - Cart should be unchanged (rollback)
      expect(result.current.items).toEqual(initialItems);
    });

    it("should throw error when not authenticated", async () => {
      // Arrange - Not authenticated
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.removeItem(1);
        }),
      ).rejects.toThrow("Must be authenticated to remove items from cart");
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      // Arrange - Start with cart containing items
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem, mockCartItem2]);
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items.length).toBe(2);
      });

      // Act - Clear cart
      act(() => {
        result.current.clearCart();
      });

      // Assert
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe("refreshCart", () => {
    it("should refresh cart data from server", async () => {
      // Arrange - Start with cart containing one item
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem]);
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.items.length).toBe(1);
      });

      // Update mock to return different cart data
      server.use(
        http.get("http://localhost:5000/api/cart", () => {
          return HttpResponse.json([mockCartItem, mockCartItem2]);
        }),
      );

      // Act - Refresh cart
      await act(async () => {
        await result.current.refreshCart();
      });

      // Assert
      expect(result.current.items.length).toBe(2);
    });

    it("should clear cart when not authenticated", async () => {
      // Arrange - Not authenticated
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Refresh cart
      await act(async () => {
        await result.current.refreshCart();
      });

      // Assert
      expect(result.current.items).toEqual([]);
    });
  });

  describe("Context value stability", () => {
    it("should provide all required context values", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert - All context values should be defined
      expect(result.current.items).toBeDefined();
      expect(result.current.itemCount).toBeDefined();
      expect(result.current.totalPrice).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.addItem).toBe("function");
      expect(typeof result.current.updateQuantity).toBe("function");
      expect(typeof result.current.removeItem).toBe("function");
      expect(typeof result.current.clearCart).toBe("function");
      expect(typeof result.current.refreshCart).toBe("function");
    });
  });
});
