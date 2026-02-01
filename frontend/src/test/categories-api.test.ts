import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { categoriesApi } from "../api/categories";
import type { Category } from "../types";

/**
 * Unit tests for categories API endpoints
 *
 * Tests verify that:
 * - API functions send requests to correct endpoints
 * - Request payloads are properly formatted
 * - Response data is correctly parsed
 * - Error handling works as expected
 */

// Mock category data for testing
const mockCategory: Category = {
  id: 1,
  name: "Electronics",
};

// Setup MSW server for API mocking
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Categories API", () => {
  describe("getAll", () => {
    it("should send GET request to /api/categories", async () => {
      // Arrange
      const mockCategories = [mockCategory];

      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const result = await categoriesApi.getAll();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Electronics");
    });

    it("should return empty array when no categories exist", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act
      const result = await categoriesApi.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should throw ApiError when request fails", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(
            { error: "Database connection failed" },
            { status: 500 },
          );
        }),
      );

      // Act & Assert
      await expect(categoriesApi.getAll()).rejects.toMatchObject({
        message: "Database connection failed",
        status: 500,
      });
    });

    it("should return multiple categories", async () => {
      // Arrange
      const mockCategories = [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Clothing" },
        { id: 3, name: "Books" },
      ];

      server.use(
        http.get("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(mockCategories);
        }),
      );

      // Act
      const result = await categoriesApi.getAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Electronics");
      expect(result[1].name).toBe("Clothing");
      expect(result[2].name).toBe("Books");
    });
  });

  describe("create", () => {
    it("should send POST request to /api/categories with category data", async () => {
      // Arrange
      const createData = {
        name: "Home & Garden",
      };

      server.use(
        http.post(
          "http://localhost:5000/api/categories",
          async ({ request }) => {
            const body = (await request.json()) as any;

            // Verify request payload
            expect(body.name).toBe(createData.name);

            return HttpResponse.json(
              {
                id: 2,
                ...body,
              },
              { status: 201 },
            );
          },
        ),
      );

      // Act
      const result = await categoriesApi.create(createData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createData.name);
      expect(result.id).toBe(2);
    });

    it("should throw ApiError when validation fails", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(
            { message: "Category name is required" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(
        categoriesApi.create({
          name: "",
        }),
      ).rejects.toMatchObject({
        message: "Category name is required",
        status: 400,
      });
    });

    it("should throw ApiError when user lacks permissions", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(
            { message: "Admin access required" },
            { status: 403 },
          );
        }),
      );

      // Act & Assert
      await expect(
        categoriesApi.create({
          name: "Test Category",
        }),
      ).rejects.toMatchObject({
        message: "Admin access required",
        status: 403,
      });
    });

    it("should throw ApiError when category name already exists", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/categories", () => {
          return HttpResponse.json(
            { message: "Category name already exists" },
            { status: 409 },
          );
        }),
      );

      // Act & Assert
      await expect(
        categoriesApi.create({
          name: "Electronics",
        }),
      ).rejects.toMatchObject({
        message: "Category name already exists",
        status: 409,
      });
    });
  });

  describe("update", () => {
    it("should send PATCH request to /api/categories/:id with update data", async () => {
      // Arrange
      const updateData = {
        name: "Consumer Electronics",
      };

      server.use(
        http.patch(
          "http://localhost:5000/api/categories/1",
          async ({ request }) => {
            const body = (await request.json()) as any;

            // Verify request payload
            expect(body.name).toBe(updateData.name);

            return HttpResponse.json({
              ...mockCategory,
              ...body,
            });
          },
        ),
      );

      // Act
      const result = await categoriesApi.update(1, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.id).toBe(1);
    });

    it("should throw ApiError when category not found", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/categories/999", () => {
          return HttpResponse.json(
            { message: "Category not found or no fields provided" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(
        categoriesApi.update(999, { name: "New Name" }),
      ).rejects.toMatchObject({
        message: "Category not found or no fields provided",
        status: 404,
      });
    });

    it("should throw ApiError when validation fails", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/categories/1", () => {
          return HttpResponse.json(
            { message: "Category name cannot be empty" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(categoriesApi.update(1, { name: "" })).rejects.toMatchObject(
        {
          message: "Category name cannot be empty",
          status: 400,
        },
      );
    });

    it("should throw ApiError when user lacks permissions", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/categories/1", () => {
          return HttpResponse.json(
            { message: "Admin access required" },
            { status: 403 },
          );
        }),
      );

      // Act & Assert
      await expect(
        categoriesApi.update(1, { name: "New Name" }),
      ).rejects.toMatchObject({
        message: "Admin access required",
        status: 403,
      });
    });

    it("should throw ApiError when category name already exists", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/categories/1", () => {
          return HttpResponse.json(
            { message: "Category name already exists" },
            { status: 409 },
          );
        }),
      );

      // Act & Assert
      await expect(
        categoriesApi.update(1, { name: "Clothing" }),
      ).rejects.toMatchObject({
        message: "Category name already exists",
        status: 409,
      });
    });
  });

  describe("delete", () => {
    it("should send DELETE request to /api/categories/:id", async () => {
      // Arrange
      let deleteCalled = false;

      server.use(
        http.delete("http://localhost:5000/api/categories/1", () => {
          deleteCalled = true;
          return HttpResponse.json({
            message: "Category deleted successfully",
            category: mockCategory,
          });
        }),
      );

      // Act
      const result = await categoriesApi.delete(1);

      // Assert
      expect(deleteCalled).toBe(true);
      expect(result.message).toBe("Category deleted successfully");
      expect(result.category).toEqual(mockCategory);
    });

    it("should throw ApiError when category not found", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/categories/999", () => {
          return HttpResponse.json(
            { message: "Category not found" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(categoriesApi.delete(999)).rejects.toMatchObject({
        message: "Category not found",
        status: 404,
      });
    });

    it("should throw ApiError when user lacks permissions", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/categories/1", () => {
          return HttpResponse.json(
            { message: "Admin access required" },
            { status: 403 },
          );
        }),
      );

      // Act & Assert
      await expect(categoriesApi.delete(1)).rejects.toMatchObject({
        message: "Admin access required",
        status: 403,
      });
    });

    it("should throw ApiError when category has associated products", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/categories/1", () => {
          return HttpResponse.json(
            {
              message: "Cannot delete category with associated products",
            },
            { status: 409 },
          );
        }),
      );

      // Act & Assert
      await expect(categoriesApi.delete(1)).rejects.toMatchObject({
        message: "Cannot delete category with associated products",
        status: 409,
      });
    });
  });

  describe("API endpoint structure", () => {
    it("should export all required functions", () => {
      expect(categoriesApi.getAll).toBeDefined();
      expect(categoriesApi.create).toBeDefined();
      expect(categoriesApi.update).toBeDefined();
      expect(categoriesApi.delete).toBeDefined();
    });

    it("should have correct function signatures", () => {
      expect(typeof categoriesApi.getAll).toBe("function");
      expect(typeof categoriesApi.create).toBe("function");
      expect(typeof categoriesApi.update).toBe("function");
      expect(typeof categoriesApi.delete).toBe("function");
    });
  });
});
