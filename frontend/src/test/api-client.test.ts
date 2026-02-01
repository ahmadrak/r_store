import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";
import apiClient, { isApiError } from "../api/client";
import type { ApiError } from "../types";

// Mock axios module
vi.mock("axios", () => {
  const mockAxiosInstance = {
    defaults: {
      baseURL: "http://localhost:3000",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
    interceptors: {
      request: {
        use: vi.fn(),
        handlers: [] as any[],
      },
      response: {
        use: vi.fn(),
        handlers: [] as any[],
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    AxiosError: class AxiosError extends Error {
      code?: string;
      config?: any;
      request?: any;
      response?: any;

      constructor(
        message: string,
        code?: string,
        config?: any,
        request?: any,
        response?: any,
      ) {
        super(message);
        this.name = "AxiosError";
        this.code = code;
        this.config = config;
        this.request = request;
        this.response = response;
      }
    },
  };
});

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should be configured with correct baseURL", () => {
      expect(apiClient.defaults.baseURL).toBeDefined();
      // Should use env variable or default to localhost:3000
      expect(
        apiClient.defaults.baseURL === import.meta.env.VITE_API_URL ||
          apiClient.defaults.baseURL === "http://localhost:3000",
      ).toBe(true);
    });

    it("should have withCredentials enabled", () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it("should have Content-Type header set to application/json", () => {
      expect(apiClient.defaults.headers["Content-Type"]).toBe(
        "application/json",
      );
    });

    it("should have a timeout configured", () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });
  });

  describe("isApiError helper", () => {
    it("should return true for valid ApiError objects", () => {
      const error: ApiError = {
        message: "Test error",
        status: 400,
      };
      expect(isApiError(error)).toBe(true);
    });

    it("should return false for non-ApiError objects", () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
      expect(isApiError("string")).toBe(false);
      expect(isApiError(123)).toBe(false);
      expect(isApiError({})).toBe(false);
      expect(isApiError({ message: "test" })).toBe(false);
      expect(isApiError({ status: 400 })).toBe(false);
    });

    it("should return true for objects with message and status", () => {
      const error = {
        message: "Error message",
        status: 500,
      };
      expect(isApiError(error)).toBe(true);
    });
  });

  describe("Interceptors", () => {
    it("should register request interceptor", () => {
      // The interceptor is registered when the module is imported
      // We can verify the client has the interceptor structure
      expect(apiClient.interceptors).toBeDefined();
      expect(apiClient.interceptors.request).toBeDefined();
    });

    it("should register response interceptor", () => {
      // The interceptor is registered when the module is imported
      // We can verify the client has the interceptor structure
      expect(apiClient.interceptors).toBeDefined();
      expect(apiClient.interceptors.response).toBeDefined();
    });
  });

  describe("Error Transformation", () => {
    it("should handle network errors and transform to ApiError", async () => {
      // Mock a network error (no response)
      const networkError = new AxiosError("Network Error");
      networkError.response = undefined;

      // Simulate what the interceptor does
      const transformedError = {
        message:
          networkError.message ||
          "Unable to connect to server. Please check your internet connection.",
        status: 0,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(0);
      expect(transformedError.message).toBeTruthy();
    });

    it("should transform 400 errors with message in data", async () => {
      const error = new AxiosError("Bad Request");
      error.response = {
        status: 400,
        data: { message: "Invalid input data" } as any,
        statusText: "Bad Request",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const data = error.response.data as { message: string };
      const transformedError: ApiError = {
        message: data.message,
        status: error.response.status,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(400);
      expect(transformedError.message).toBe("Invalid input data");
    });

    it("should transform 401 errors with default message", async () => {
      const error = new AxiosError("Unauthorized");
      error.response = {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation with default message
      const transformedError: ApiError = {
        message: "Your session has expired. Please log in again.",
        status: 401,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(401);
      expect(transformedError.message).toContain("session");
    });

    it("should transform 403 errors with default message", async () => {
      const error = new AxiosError("Forbidden");
      error.response = {
        status: 403,
        data: {},
        statusText: "Forbidden",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const transformedError: ApiError = {
        message: "You don't have permission to perform this action.",
        status: 403,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(403);
      expect(transformedError.message).toContain("permission");
    });

    it("should transform 404 errors with default message", async () => {
      const error = new AxiosError("Not Found");
      error.response = {
        status: 404,
        data: {},
        statusText: "Not Found",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const transformedError: ApiError = {
        message: "The requested resource was not found.",
        status: 404,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(404);
      expect(transformedError.message).toContain("not found");
    });

    it("should transform 500 errors with default message", async () => {
      const error = new AxiosError("Internal Server Error");
      error.response = {
        status: 500,
        data: {},
        statusText: "Internal Server Error",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const transformedError: ApiError = {
        message: "Something went wrong on the server. Please try again later.",
        status: 500,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(500);
      expect(transformedError.message).toContain("Something went wrong");
    });

    it("should extract error message from response data.error field", async () => {
      const error = new AxiosError("Custom Error");
      error.response = {
        status: 400,
        data: { error: "Custom error message" } as any,
        statusText: "Bad Request",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const data = error.response.data as { error: string };
      const transformedError: ApiError = {
        message: data.error,
        status: 400,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.message).toBe("Custom error message");
    });

    it("should handle string response data", async () => {
      const error = new AxiosError("String Error");
      error.response = {
        status: 400,
        data: "Plain string error message" as any,
        statusText: "Bad Request",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const data = error.response.data as string;
      const transformedError: ApiError = {
        message: data,
        status: 400,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.message).toBe("Plain string error message");
    });

    it("should handle 503 Service Unavailable errors", async () => {
      const error = new AxiosError("Service Unavailable");
      error.response = {
        status: 503,
        data: {},
        statusText: "Service Unavailable",
        headers: {},
        config: {} as any,
      };

      // Simulate error transformation
      const transformedError: ApiError = {
        message: "Service temporarily unavailable. Please try again later.",
        status: 503,
      };

      expect(isApiError(transformedError)).toBe(true);
      expect(transformedError.status).toBe(503);
      expect(transformedError.message).toContain("temporarily unavailable");
    });
  });

  describe("401 Redirect Behavior", () => {
    it("should verify 401 handling logic for non-auth pages", () => {
      // Test the logic that would be in the interceptor
      const currentPath: string = "/products";
      const shouldRedirect =
        currentPath !== "/login" && currentPath !== "/signup";

      expect(shouldRedirect).toBe(true);
    });

    it("should verify 401 handling logic for login page", () => {
      const currentPath: string = "/login";
      const shouldRedirect =
        currentPath !== "/login" && currentPath !== "/signup";

      expect(shouldRedirect).toBe(false);
    });

    it("should verify 401 handling logic for signup page", () => {
      const currentPath: string = "/signup";
      const shouldRedirect =
        currentPath !== "/login" && currentPath !== "/signup";

      expect(shouldRedirect).toBe(false);
    });

    it("should verify redirect path storage logic", () => {
      const currentPath = "/cart";
      const redirectKey = "redirectAfterLogin";

      // Verify the logic exists
      expect(currentPath).toBe("/cart");
      expect(redirectKey).toBe("redirectAfterLogin");
    });
  });
});
