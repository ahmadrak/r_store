import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { productsApi } from "../api/products";
import type { ProductWithImages, ProductImage } from "../api/products";
import type { Product } from "../types";

/**
 * Unit tests for products API endpoints
 *
 * Tests verify that:
 * - API functions send requests to correct endpoints
 * - Request payloads are properly formatted
 * - Response data is correctly parsed
 * - Error handling works as expected
 */

// Mock product data for testing
const mockProduct: Product = {
  id: 1,
  name: "Test Product",
  description: "A test product description",
  price: 29.99,
  stock: 100,
  category_id: 1,
  category: {
    id: 1,
    name: "Electronics",
  },
  main_image_url: "https://example.com/image.jpg",
  created_at: "2024-01-01T00:00:00.000Z",
};

const mockProductImage: ProductImage = {
  id: 1,
  product_id: 1,
  image_url: "https://example.com/image.jpg",
  is_main: true,
};

const mockProductWithImages: ProductWithImages = {
  id: 1,
  name: "Test Product",
  description: "A test product description",
  price: 29.99,
  stock: 100,
  category_id: 1,
  category: {
    id: 1,
    name: "Electronics",
  },
  created_at: "2024-01-01T00:00:00.000Z",
  images: [mockProductImage],
};

// Setup MSW server for API mocking
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Products API", () => {
  describe("getAll", () => {
    it("should send GET request to /api/products", async () => {
      // Arrange
      const mockProducts = [mockProductWithImages];

      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const result = await productsApi.getAll();

      // Assert
      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Product");
    });

    it("should return empty array when no products exist", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act
      const result = await productsApi.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should throw ApiError when request fails", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(
            { error: "Database connection failed" },
            { status: 500 },
          );
        }),
      );

      // Act & Assert
      await expect(productsApi.getAll()).rejects.toMatchObject({
        message: "Database connection failed",
        status: 500,
      });
    });
  });

  describe("getById", () => {
    it("should return product when found", async () => {
      // Arrange
      const mockProducts = [mockProductWithImages];

      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const result = await productsApi.getById(1);

      // Assert
      expect(result).toEqual(mockProductWithImages);
      expect(result.id).toBe(1);
    });

    it("should throw error when product not found", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act & Assert
      await expect(productsApi.getById(999)).rejects.toMatchObject({
        response: {
          status: 404,
          data: { message: "Product not found" },
        },
      });
    });

    it("should filter correct product from multiple products", async () => {
      // Arrange
      const mockProducts = [
        { ...mockProductWithImages, id: 1, name: "Product 1" },
        { ...mockProductWithImages, id: 2, name: "Product 2" },
        { ...mockProductWithImages, id: 3, name: "Product 3" },
      ];

      server.use(
        http.get("http://localhost:5000/api/products", () => {
          return HttpResponse.json(mockProducts);
        }),
      );

      // Act
      const result = await productsApi.getById(2);

      // Assert
      expect(result.id).toBe(2);
      expect(result.name).toBe("Product 2");
    });
  });

  describe("create", () => {
    it("should send POST request to /api/products with product data", async () => {
      // Arrange
      const createData = {
        name: "New Product",
        description: "New product description",
        price: 49.99,
        stock: 50,
        category_id: 2,
      };

      server.use(
        http.post("http://localhost:5000/api/products", async ({ request }) => {
          const body = (await request.json()) as any;

          // Verify request payload
          expect(body.name).toBe(createData.name);
          expect(body.description).toBe(createData.description);
          expect(body.price).toBe(createData.price);
          expect(body.stock).toBe(createData.stock);
          expect(body.category_id).toBe(createData.category_id);

          return HttpResponse.json(
            {
              id: 2,
              ...body,
              main_image_url: null,
              created_at: "2024-01-02T00:00:00.000Z",
            },
            { status: 201 },
          );
        }),
      );

      // Act
      const result = await productsApi.create(createData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createData.name);
      expect(result.price).toBe(createData.price);
      expect(result.stock).toBe(createData.stock);
    });

    it("should throw ApiError when validation fails", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/products", () => {
          return HttpResponse.json(
            { message: "Product name is required" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(
        productsApi.create({
          name: "",
          description: "Test",
          price: 10,
          stock: 5,
          category_id: 1,
        }),
      ).rejects.toMatchObject({
        message: "Product name is required",
        status: 400,
      });
    });

    it("should throw ApiError when user lacks permissions", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/products", () => {
          return HttpResponse.json(
            { message: "Admin access required" },
            { status: 403 },
          );
        }),
      );

      // Act & Assert
      await expect(
        productsApi.create({
          name: "Test",
          description: "Test",
          price: 10,
          stock: 5,
          category_id: 1,
        }),
      ).rejects.toMatchObject({
        message: "Admin access required",
        status: 403,
      });
    });
  });

  describe("update", () => {
    it("should send PATCH request to /api/products/:id with update data", async () => {
      // Arrange
      const updateData = {
        price: 39.99,
        stock: 75,
      };

      server.use(
        http.patch(
          "http://localhost:5000/api/products/1",
          async ({ request }) => {
            const body = (await request.json()) as any;

            // Verify request payload
            expect(body.price).toBe(updateData.price);
            expect(body.stock).toBe(updateData.stock);

            return HttpResponse.json({
              ...mockProduct,
              ...body,
            });
          },
        ),
      );

      // Act
      const result = await productsApi.update(1, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.price).toBe(updateData.price);
      expect(result.stock).toBe(updateData.stock);
    });

    it("should throw ApiError when product not found", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/products/999", () => {
          return HttpResponse.json(
            { message: "Product not found or no fields provided" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(
        productsApi.update(999, { price: 10 }),
      ).rejects.toMatchObject({
        message: "Product not found or no fields provided",
        status: 404,
      });
    });

    it("should throw ApiError when validation fails", async () => {
      // Arrange
      server.use(
        http.patch("http://localhost:5000/api/products/1", () => {
          return HttpResponse.json(
            { message: "Invalid price" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(productsApi.update(1, { price: -10 })).rejects.toMatchObject(
        {
          message: "Invalid price",
          status: 400,
        },
      );
    });
  });

  describe("delete", () => {
    it("should send DELETE request to /api/products/:id", async () => {
      // Arrange
      let deleteCalled = false;

      server.use(
        http.delete("http://localhost:5000/api/products/1", () => {
          deleteCalled = true;
          return HttpResponse.json({
            message: "Product deleted successfully",
            product: mockProduct,
          });
        }),
      );

      // Act
      const result = await productsApi.delete(1);

      // Assert
      expect(deleteCalled).toBe(true);
      expect(result.message).toBe("Product deleted successfully");
      expect(result.product).toEqual(mockProduct);
    });

    it("should throw ApiError when product not found", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/products/999", () => {
          return HttpResponse.json(
            { message: "Product not found" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(productsApi.delete(999)).rejects.toMatchObject({
        message: "Product not found",
        status: 404,
      });
    });

    it("should throw ApiError when user lacks permissions", async () => {
      // Arrange
      server.use(
        http.delete("http://localhost:5000/api/products/1", () => {
          return HttpResponse.json(
            { message: "Admin access required" },
            { status: 403 },
          );
        }),
      );

      // Act & Assert
      await expect(productsApi.delete(1)).rejects.toMatchObject({
        message: "Admin access required",
        status: 403,
      });
    });
  });

  describe("addImages", () => {
    it("should send POST request to /api/products/:id/images with image data", async () => {
      // Arrange
      const imageData = {
        image_url: "https://example.com/new-image.jpg",
        is_main: false,
      };

      server.use(
        http.post(
          "http://localhost:5000/api/products/1/images",
          async ({ request }) => {
            const body = (await request.json()) as any;

            // Verify request payload
            expect(body.image_url).toBe(imageData.image_url);
            expect(body.is_main).toBe(imageData.is_main);

            return HttpResponse.json(
              {
                id: 2,
                product_id: 1,
                ...body,
              },
              { status: 201 },
            );
          },
        ),
      );

      // Act
      const result = await productsApi.addImages(1, imageData);

      // Assert
      expect(result).toBeDefined();
      expect(result.product_id).toBe(1);
      expect(result.image_url).toBe(imageData.image_url);
      expect(result.is_main).toBe(imageData.is_main);
    });

    it("should throw ApiError when image_url is missing", async () => {
      // Arrange
      server.use(
        http.post("http://localhost:5000/api/products/1/images", () => {
          return HttpResponse.json(
            { error: "image_url is required" },
            { status: 400 },
          );
        }),
      );

      // Act & Assert
      await expect(
        productsApi.addImages(1, { image_url: "" }),
      ).rejects.toMatchObject({
        message: "image_url is required",
        status: 400,
      });
    });

    it("should default is_main to false when not provided", async () => {
      // Arrange
      const imageData = {
        image_url: "https://example.com/image.jpg",
      };

      server.use(
        http.post(
          "http://localhost:5000/api/products/1/images",
          async ({ request }) => {
            const body = (await request.json()) as any;

            return HttpResponse.json(
              {
                id: 3,
                product_id: 1,
                image_url: body.image_url,
                is_main: body.is_main || false,
              },
              { status: 201 },
            );
          },
        ),
      );

      // Act
      const result = await productsApi.addImages(1, imageData);

      // Assert
      expect(result.is_main).toBe(false);
    });
  });

  describe("getImages", () => {
    it("should send GET request to /api/products/:id/images", async () => {
      // Arrange
      const mockImages = [
        mockProductImage,
        {
          id: 2,
          product_id: 1,
          image_url: "https://example.com/image2.jpg",
          is_main: false,
        },
      ];

      server.use(
        http.get("http://localhost:5000/api/products/1/images", () => {
          return HttpResponse.json(mockImages);
        }),
      );

      // Act
      const result = await productsApi.getImages(1);

      // Assert
      expect(result).toEqual(mockImages);
      expect(result).toHaveLength(2);
      expect(result[0].is_main).toBe(true);
      expect(result[1].is_main).toBe(false);
    });

    it("should return empty array when product has no images", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products/1/images", () => {
          return HttpResponse.json([]);
        }),
      );

      // Act
      const result = await productsApi.getImages(1);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should throw ApiError when request fails", async () => {
      // Arrange
      server.use(
        http.get("http://localhost:5000/api/products/999/images", () => {
          return HttpResponse.json(
            { error: "Product not found" },
            { status: 404 },
          );
        }),
      );

      // Act & Assert
      await expect(productsApi.getImages(999)).rejects.toMatchObject({
        message: "Product not found",
        status: 404,
      });
    });
  });

  describe("API endpoint structure", () => {
    it("should export all required functions", () => {
      expect(productsApi.getAll).toBeDefined();
      expect(productsApi.getById).toBeDefined();
      expect(productsApi.create).toBeDefined();
      expect(productsApi.update).toBeDefined();
      expect(productsApi.delete).toBeDefined();
      expect(productsApi.addImages).toBeDefined();
      expect(productsApi.getImages).toBeDefined();
    });

    it("should have correct function signatures", () => {
      expect(typeof productsApi.getAll).toBe("function");
      expect(typeof productsApi.getById).toBe("function");
      expect(typeof productsApi.create).toBe("function");
      expect(typeof productsApi.update).toBe("function");
      expect(typeof productsApi.delete).toBe("function");
      expect(typeof productsApi.addImages).toBe("function");
      expect(typeof productsApi.getImages).toBe("function");
    });
  });
});
