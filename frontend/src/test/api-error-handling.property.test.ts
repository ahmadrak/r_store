import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { productsApi } from "../api/products";
import { cartApi } from "../api/cart";

/**
 * Property-Based Tests for API Error Handling
 *
 * These tests verify that the application properly handles API errors
 * by ensuring error responses are propagated correctly to the caller.
 * The UI layer (components) is responsible for displaying user-friendly
 * error notifications using the NotificationContext.
 */

// Base URL for API (matches the API client configuration)
const API_BASE_URL = "http://localhost:5000";

// Create MSW server for mocking API responses
const server = setupServer();

beforeEach(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

describe("API Error Handling Property Tests", () => {
  /**
   * Feature: ecommerce-frontend, Property 8: API Error Display
   *
   * Property: For any failed API request, the API client should throw an error
   * that can be caught and displayed as a user-friendly notification.
   *
   * This test verifies that when API requests fail with various HTTP status codes,
   * the error is properly propagated to the caller so it can be handled by the UI layer.
   *
   * Validates: Requirements 2.7, 3.7
   */
  it(
    "should throw errors for failed API requests that can be displayed to users",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random HTTP error status codes
          fc.constantFrom(400, 403, 404, 500, 502, 503),
          // Generate random error messages
          fc.string({ minLength: 1, maxLength: 100 }),
          async (statusCode, errorMessage) => {
            // Setup: Mock API to return error response
            server.use(
              http.get(`${API_BASE_URL}/api/products`, () => {
                return HttpResponse.json(
                  { message: errorMessage },
                  { status: statusCode },
                );
              }),
            );

            // Act & Assert: Verify error is thrown and contains message
            try {
              await productsApi.getAll();
              // If we reach here, the test should fail
              expect.fail("Expected API call to throw an error");
            } catch (error: any) {
              // Verify error object exists and has a message
              expect(error).toBeDefined();
              expect(error.message).toBeDefined();

              // Verify the error can be used to display a notification
              // The error should have a message property
              expect(error.message.length).toBeGreaterThan(0);

              // Verify status is included
              expect(error.status).toBe(statusCode);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  /**
   * Feature: ecommerce-frontend, Property 8: API Error Display (Cart Operations)
   *
   * Property: For any failed cart API request, the API client should throw an error
   * that can be caught and displayed as a user-friendly notification.
   *
   * This test verifies cart-specific API error handling.
   *
   * Validates: Requirements 3.7
   */
  it(
    "should throw errors for failed cart API requests",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random HTTP error status codes
          fc.constantFrom(400, 403, 404, 500),
          // Generate random error messages
          fc.string({ minLength: 1, maxLength: 100 }),
          // Generate random product IDs and quantities
          fc.nat({ max: 1000 }),
          fc.integer({ min: 1, max: 99 }),
          async (statusCode, errorMessage, productId, quantity) => {
            // Setup: Mock API to return error response
            server.use(
              http.post(`${API_BASE_URL}/api/cart`, () => {
                return HttpResponse.json(
                  { message: errorMessage },
                  { status: statusCode },
                );
              }),
            );

            // Act & Assert: Verify error is thrown and contains message
            try {
              await cartApi.add(productId, quantity);
              // If we reach here, the test should fail
              expect.fail("Expected API call to throw an error");
            } catch (error: any) {
              // Verify error object exists and has a message
              expect(error).toBeDefined();
              expect(error.message).toBeDefined();

              // Verify the error can be used to display a notification
              expect(error.message.length).toBeGreaterThan(0);

              // Verify status is included
              expect(error.status).toBe(statusCode);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  /**
   * Feature: ecommerce-frontend, Property 8: API Error Display (Network Errors)
   *
   * Property: For any network error (no response from server), the API client
   * should throw an error that can be caught and displayed as a connectivity issue.
   *
   * This test verifies network error handling.
   *
   * Validates: Requirements 2.7, 3.7
   */
  it(
    "should throw errors for network failures",
    { timeout: 30000 },
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Setup: Mock API to simulate network error
          server.use(
            http.get(`${API_BASE_URL}/api/products`, () => {
              return HttpResponse.error();
            }),
          );

          // Act & Assert: Verify error is thrown
          try {
            await productsApi.getAll();
            // If we reach here, the test should fail
            expect.fail("Expected API call to throw an error");
          } catch (error: any) {
            // Verify error object exists
            expect(error).toBeDefined();

            // Network errors should have a message
            expect(error.message).toBeDefined();
            expect(error.message.length).toBeGreaterThan(0);

            // Network errors should have status 0
            expect(error.status).toBe(0);
          }
        }),
        { numRuns: 50 },
      );
    },
  );
});
