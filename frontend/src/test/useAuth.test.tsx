import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "../hooks/useAuth";
import { AuthProvider } from "../contexts/AuthContext";
import type { ReactNode } from "react";

/**
 * Test suite for useAuth hook
 *
 * Validates that the useAuth hook can be imported from hooks/useAuth.ts
 * and works correctly when used within an AuthProvider.
 */
describe("useAuth hook", () => {
  it("should be importable from hooks/useAuth", () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe("function");
  });

  it("should throw error when used outside AuthProvider", () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    console.error = originalError;
  });

  it("should return auth context when used within AuthProvider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Verify all expected properties are present
    expect(result.current).toHaveProperty("user");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isAuthenticated");
    expect(result.current).toHaveProperty("isAdmin");
    expect(result.current).toHaveProperty("login");
    expect(result.current).toHaveProperty("signup");
    expect(result.current).toHaveProperty("logout");
    expect(result.current).toHaveProperty("refreshUser");

    // Verify initial state
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);

    // Verify functions are callable
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.signup).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.refreshUser).toBe("function");
  });
});
