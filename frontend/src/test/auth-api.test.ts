import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { authApi } from "../api/auth";
import type { User } from "../types";

/**
 * Unit tests for authentication API endpoints
 *
 * Tests verify that:
 * - API functions send requests to correct endpoints
 * - Request payloads are properly formatted
 * - Response data is correctly parsed
 * - Error handling works as expected
 */

// Mock user data for testing
const mockUser: User = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "user",
};

// Setup MSW server for API mocking
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Authentication API", () => {
  describe("signup", () => {
    it("should send POST request to /api/auth/signup with user data", async () => {
      // Arrange
      const signupData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
      };

      server.use(
        http.post(
          "http://localhost:5000/api/auth/signup",
          async ({ request }) => {
            const body = (await request.json()) as any;

            // Verify request payload
            expect(body.name).toBe(signupData.name);
            expect(body.email).toBe(signupData.email);
            expect(body.password).toBe(signupData.password);

            // Backend returns user directly (not wrapped in { user: ... })
            return HttpResponse.json({
              id: 2,
              name: body.name,
              email: body.email,
              role: "user",
            });
          },
        ),
      );

      // Act
      const result = await authApi.signup(signupData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(signupData.name);
      expect(result.email).toBe(signupData.email);
      expect(result.role).toBe("user");
    });

    it("should throw ApiError when signup fails", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/auth/signup", () => {
          return HttpResponse.json(
            { message: "Email already exists" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(
        authApi.signup({
          name: "Test",
          email: "existing@example.com",
          password: "password",
        }),
      ).rejects.toMatchObject({
        message: "Email already exists",
        status: 400,
      });
    });
  });

  describe("login", () => {
    it("should send POST request to /api/auth/login with credentials", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      server.use(
        http.post(
          "http://localhost:5000/api/auth/login",
          async ({ request }) => {
            const body = (await request.json()) as any;

            // Verify request payload
            expect(body.email).toBe(loginData.email);
            expect(body.password).toBe(loginData.password);

            return HttpResponse.json({ user: mockUser });
          },
        ),
      );

      // Act
      const result = await authApi.login(loginData);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it("should throw ApiError when login fails with invalid credentials", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/auth/login", () => {
          return HttpResponse.json(
            { message: "Invalid email or password" },
            { status: 401 },
          );
        }),
      );

      // Act & Assert
      await expect(
        authApi.login({
          email: "wrong@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toMatchObject({
        message: "Invalid email or password",
        status: 401,
      });
    });
  });

  describe("logout", () => {
    it("should send POST request to /api/auth/logout", async () => {
      // Arrange
      let logoutCalled = false;

      server.use(
        http.post("http://localhost:5000/api/auth/logout", () => {
          logoutCalled = true;
          return HttpResponse.json({ message: "Logged out successfully" });
        }),
      );

      // Act
      await authApi.logout();

      // Assert
      expect(logoutCalled).toBe(true);
    });

    it("should handle logout errors gracefully", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/auth/logout", () => {
          return HttpResponse.json(
            { message: "Session not found" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(authApi.logout()).rejects.toMatchObject({
        message: "Session not found",
        status: 400,
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should send GET request to /api/auth/me", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json({ user: mockUser });
        }),
      );

      // Act
      const result = await authApi.getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
    });

    it("should throw ApiError when user is not authenticated", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/auth/me", () => {
          return HttpResponse.json(
            { message: "Not authenticated" },
            { status: 401 },
          );
        }),
      );

      // Act & Assert
      await expect(authApi.getCurrentUser()).rejects.toMatchObject({
        message: "Not authenticated",
        status: 401,
      });
    });
  });

  describe("API endpoint structure", () => {
    it("should export all required functions", () => {
      expect(authApi.signup).toBeDefined();
      expect(authApi.login).toBeDefined();
      expect(authApi.logout).toBeDefined();
      expect(authApi.getCurrentUser).toBeDefined();
    });

    it("should have correct function signatures", () => {
      expect(typeof authApi.signup).toBe("function");
      expect(typeof authApi.login).toBe("function");
      expect(typeof authApi.logout).toBe("function");
      expect(typeof authApi.getCurrentUser).toBe("function");
    });
  });
});
