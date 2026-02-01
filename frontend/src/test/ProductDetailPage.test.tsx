import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/ProductDetail";
import type { ProductWithImages } from "../api/products";
import * as useProductHook from "../hooks/useProduct";
import * as CartContext from "../contexts/CartContext";
import * as NotificationContext from "../contexts/NotificationContext";

// Mock the hooks
vi.mock("../hooks/useProduct");
vi.mock("../contexts/CartContext");
vi.mock("../contexts/NotificationContext");

describe("ProductDetail Page", () => {
  const mockProduct: ProductWithImages = {
    id: 123,
    name: "Test Product",
    description: "Test description",
    price: 29.99,
    stock: 10,
    category_id: 1,
    category: {
      id: 1,
      name: "Electronics",
    },
    created_at: "2024-01-01T00:00:00Z",
    images: [
      {
        id: 1,
        product_id: 123,
        image_url: "https://example.com/image1.jpg",
        is_main: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCart hook
    vi.spyOn(CartContext, "useCart").mockReturnValue({
      items: [],
      itemCount: 0,
      totalPrice: 0,
      isLoading: false,
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      refreshCart: vi.fn(),
    });

    // Mock useNotification hook
    vi.spyOn(NotificationContext, "useNotification").mockReturnValue({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
    });
  });

  const renderWithRouter = (productId: string = "123") => {
    return render(
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  describe("Loading State", () => {
    it("should display loading spinner while fetching product", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
        status: "pending",
      } as any);

      renderWithRouter();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(
        screen.getByText(/Loading product details.../i),
      ).toBeInTheDocument();
    });

    it("should display loading message", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
        status: "pending",
      } as any);

      renderWithRouter();

      expect(
        screen.getByText(/Loading product details.../i),
      ).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when product fetch fails", () => {
      const error = new Error("Product not found");
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
        status: "error",
      } as any);

      renderWithRouter();

      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Product Not Found/i }),
      ).toBeInTheDocument();
    });

    it("should display error message text", () => {
      const error = new Error("Network error");
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
        status: "error",
      } as any);

      renderWithRouter();

      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    it("should display back to products link on error", () => {
      const error = new Error("Product not found");
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
        status: "error",
      } as any);

      renderWithRouter();

      const backLink = screen.getByText(/Back to Products/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest("a")).toHaveAttribute("href", "/");
    });
  });

  describe("Success State", () => {
    it("should display product when loaded successfully", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      expect(screen.getByTestId("product-detail")).toBeInTheDocument();
      expect(screen.getByTestId("product-name")).toHaveTextContent(
        "Test Product",
      );
    });

    it("should display breadcrumb navigation", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      expect(screen.getByText("Home")).toBeInTheDocument();
      // Check breadcrumb specifically (not the h1)
      const breadcrumb = screen.getByRole("navigation", {
        name: /breadcrumb/i,
      });
      expect(breadcrumb).toHaveTextContent("Test Product");
    });

    it("should have home link in breadcrumb", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      const homeLink = screen.getByText("Home");
      expect(homeLink.closest("a")).toHaveAttribute("href", "/");
    });
  });

  describe("Route Parameters", () => {
    it("should parse product ID from URL params", () => {
      const useProductSpy = vi
        .spyOn(useProductHook, "useProduct")
        .mockReturnValue({
          data: mockProduct,
          isLoading: false,
          error: null,
          isError: false,
          isSuccess: true,
          status: "success",
        } as any);

      renderWithRouter("456");

      expect(useProductSpy).toHaveBeenCalledWith(456);
    });

    it("should handle invalid product ID", () => {
      const useProductSpy = vi
        .spyOn(useProductHook, "useProduct")
        .mockReturnValue({
          data: undefined,
          isLoading: false,
          error: new Error("Invalid ID"),
          isError: true,
          isSuccess: false,
          status: "error",
        } as any);

      renderWithRouter("invalid");

      // Should parse as 0 or NaN and still call useProduct
      expect(useProductSpy).toHaveBeenCalled();
    });
  });

  describe("Product Not Found", () => {
    it("should display not found message when product is null", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      expect(screen.getByText(/Product Not Found/i)).toBeInTheDocument();
    });

    it("should display not found message when product is undefined", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      expect(screen.getByText(/Product Not Found/i)).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should pass product data to ProductDetail component", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      // Verify product details are rendered
      expect(screen.getByTestId("product-name")).toHaveTextContent(
        "Test Product",
      );
      expect(screen.getByTestId("product-description")).toHaveTextContent(
        "Test description",
      );
      expect(screen.getByTestId("product-price")).toHaveTextContent("$29.99");
    });

    it("should render all product detail sections", () => {
      vi.spyOn(useProductHook, "useProduct").mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: "success",
      } as any);

      renderWithRouter();

      // Check for key sections
      expect(screen.getByTestId("product-detail")).toBeInTheDocument();
      expect(screen.getByTestId("main-image")).toBeInTheDocument();
      expect(screen.getByTestId("stock-status")).toBeInTheDocument();
      expect(screen.getByTestId("add-to-cart-button")).toBeInTheDocument();
    });
  });
});
