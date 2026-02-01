import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCart } from "../hooks/useCart";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import type { ReactNode } from "react";

/**
 * Test suite for useCart hook
 *
 * Validates that the useCart hook can be imported from hooks/useCart.ts
 * and works correctly when used within a CartProvider.
 */
describe("useCart hook", () => {
  it("should be importable from hooks/useCart", () => {
    expect(useCart).toBeDefined();
    expect(typeof useCart).toBe("function");
  });

  it("should throw error when used outside CartProvider", () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart must be used within a CartProvider");

    console.error = originalError;
  });

  it("should return cart context when used within CartProvider", () => {
    // CartProvider requires AuthProvider
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    // Verify all expected properties are present
    expect(result.current).toHaveProperty("items");
    expect(result.current).toHaveProperty("itemCount");
    expect(result.current).toHaveProperty("totalPrice");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("addItem");
    expect(result.current).toHaveProperty("updateQuantity");
    expect(result.current).toHaveProperty("removeItem");
    expect(result.current).toHaveProperty("clearCart");
    expect(result.current).toHaveProperty("refreshCart");

    // Verify initial state
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.isLoading).toBe(false);

    // Verify functions are callable
    expect(typeof result.current.addItem).toBe("function");
    expect(typeof result.current.updateQuantity).toBe("function");
    expect(typeof result.current.removeItem).toBe("function");
    expect(typeof result.current.clearCart).toBe("function");
    expect(typeof result.current.refreshCart).toBe("function");
  });
});
