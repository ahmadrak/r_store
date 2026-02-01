import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductDetail } from "../components/product/ProductDetail";
import type { ProductWithImages } from "../api/products";
import * as CartContext from "../contexts/CartContext";
import * as NotificationContext from "../contexts/NotificationContext";

// Mock the hooks
vi.mock("../contexts/CartContext");
vi.mock("../contexts/NotificationContext");

describe("ProductDetail Component", () => {
  const mockAddItem = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();

  const mockProduct: ProductWithImages = {
    id: 1,
    name: "Test Product",
    description: "This is a test product description",
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
        product_id: 1,
        image_url: "https://example.com/image1.jpg",
        is_main: true,
      },
      {
        id: 2,
        product_id: 1,
        image_url: "https://example.com/image2.jpg",
        is_main: false,
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
      addItem: mockAddItem,
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      refreshCart: vi.fn(),
    });

    // Mock useNotification hook
    vi.spyOn(NotificationContext, "useNotification").mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showInfo: vi.fn(),
    });
  });

  describe("Rendering", () => {
    it("should render product name", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("product-name")).toHaveTextContent(
        "Test Product",
      );
    });

    it("should render product description", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("product-description")).toHaveTextContent(
        "This is a test product description",
      );
    });

    it("should render product price formatted as currency", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("product-price")).toHaveTextContent("$29.99");
    });

    it("should render stock status", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("stock-status")).toBeInTheDocument();
    });

    it("should render category badge", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    it("should render main image", () => {
      render(<ProductDetail product={mockProduct} />);
      const mainImage = screen.getByTestId("main-image");
      expect(mainImage).toHaveAttribute(
        "src",
        "https://example.com/image1.jpg",
      );
    });

    it("should render thumbnail gallery when multiple images exist", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("thumbnail-gallery")).toBeInTheDocument();
      expect(screen.getByTestId("thumbnail-0")).toBeInTheDocument();
      expect(screen.getByTestId("thumbnail-1")).toBeInTheDocument();
    });

    it("should not render thumbnail gallery when only one image exists", () => {
      const productWithOneImage = {
        ...mockProduct,
        images: [mockProduct.images[0]],
      };
      render(<ProductDetail product={productWithOneImage} />);
      expect(screen.queryByTestId("thumbnail-gallery")).not.toBeInTheDocument();
    });

    it("should render placeholder when no images exist", () => {
      const productWithNoImages = {
        ...mockProduct,
        images: [],
      };
      render(<ProductDetail product={productWithNoImages} />);
      // Should render SVG placeholder - check that main-image doesn't exist
      expect(screen.queryByTestId("main-image")).not.toBeInTheDocument();
      // Check that placeholder SVG exists
      const container = screen.getByTestId("product-detail");
      expect(container.innerHTML).toContain("svg");
    });
  });

  describe("Stock Status", () => {
    it("should show 'In Stock' for products with stock >= 10", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(
        screen.getByText(/In Stock \(10 available\)/i),
      ).toBeInTheDocument();
    });

    it("should show 'Low Stock' warning for products with stock < 10", () => {
      const lowStockProduct = { ...mockProduct, stock: 5 };
      render(<ProductDetail product={lowStockProduct} />);
      expect(screen.getByText(/Only 5 left in stock/i)).toBeInTheDocument();
    });

    it("should show 'Out of Stock' for products with stock = 0", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductDetail product={outOfStockProduct} />);
      const outOfStockElements = screen.getAllByText(/Out of Stock/i);
      expect(outOfStockElements.length).toBeGreaterThanOrEqual(1);
    });

    it("should display out of stock overlay on image when stock = 0", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductDetail product={outOfStockProduct} />);
      // Should have two "Out of Stock" elements (overlay and status)
      const outOfStockElements = screen.getAllByText(/Out of Stock/i);
      expect(outOfStockElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Image Gallery", () => {
    it("should switch main image when thumbnail is clicked", async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      const mainImage = screen.getByTestId("main-image");
      expect(mainImage).toHaveAttribute(
        "src",
        "https://example.com/image1.jpg",
      );

      // Click second thumbnail
      const thumbnail1 = screen.getByTestId("thumbnail-1");
      await user.click(thumbnail1);

      // Main image should change
      expect(mainImage).toHaveAttribute(
        "src",
        "https://example.com/image2.jpg",
      );
    });

    it("should highlight selected thumbnail", () => {
      render(<ProductDetail product={mockProduct} />);
      const thumbnail0 = screen.getByTestId("thumbnail-0");
      expect(thumbnail0).toHaveClass("border-blue-600");
    });
  });

  describe("Quantity Selector", () => {
    it("should render quantity selector for in-stock products", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("quantity-input")).toBeInTheDocument();
      expect(screen.getByTestId("decrease-quantity")).toBeInTheDocument();
      expect(screen.getByTestId("increase-quantity")).toBeInTheDocument();
    });

    it("should not render quantity selector for out-of-stock products", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductDetail product={outOfStockProduct} />);
      expect(screen.queryByTestId("quantity-input")).not.toBeInTheDocument();
    });

    it("should start with quantity of 1", () => {
      render(<ProductDetail product={mockProduct} />);
      const quantityInput = screen.getByTestId(
        "quantity-input",
      ) as HTMLInputElement;
      expect(quantityInput.value).toBe("1");
    });

    it("should increase quantity when increase button is clicked", async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      const increaseButton = screen.getByTestId("increase-quantity");
      await user.click(increaseButton);

      const quantityInput = screen.getByTestId(
        "quantity-input",
      ) as HTMLInputElement;
      expect(quantityInput.value).toBe("2");
    });

    it("should decrease quantity when decrease button is clicked", async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      // First increase to 2
      const increaseButton = screen.getByTestId("increase-quantity");
      await user.click(increaseButton);

      // Then decrease back to 1
      const decreaseButton = screen.getByTestId("decrease-quantity");
      await user.click(decreaseButton);

      const quantityInput = screen.getByTestId(
        "quantity-input",
      ) as HTMLInputElement;
      expect(quantityInput.value).toBe("1");
    });

    it("should not decrease quantity below 1", async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      const decreaseButton = screen.getByTestId("decrease-quantity");
      await user.click(decreaseButton);

      const quantityInput = screen.getByTestId(
        "quantity-input",
      ) as HTMLInputElement;
      expect(quantityInput.value).toBe("1");
    });

    it("should not increase quantity above stock", async () => {
      const user = userEvent.setup();
      const limitedStockProduct = { ...mockProduct, stock: 2 };
      render(<ProductDetail product={limitedStockProduct} />);

      const increaseButton = screen.getByTestId("increase-quantity");

      // Try to increase to 3 (should stop at 2)
      await user.click(increaseButton);
      await user.click(increaseButton);
      await user.click(increaseButton);

      const quantityInput = screen.getByTestId(
        "quantity-input",
      ) as HTMLInputElement;
      expect(quantityInput.value).toBe("2");
    });

    it("should allow manual quantity input", async () => {
      const user = userEvent.setup();
      render(<ProductDetail product={mockProduct} />);

      const quantityInput = screen.getByTestId(
        "quantity-input",
      ) as HTMLInputElement;

      // Click the input to focus it
      await user.click(quantityInput);
      // Select all and replace with new value
      await user.keyboard("{Control>}a{/Control}5");

      // The input should reflect the typed value
      expect(quantityInput.value).toBe("5");
    });

    it("should disable decrease button when quantity is 1", () => {
      render(<ProductDetail product={mockProduct} />);
      const decreaseButton = screen.getByTestId("decrease-quantity");
      expect(decreaseButton).toBeDisabled();
    });

    it("should disable increase button when quantity equals stock", async () => {
      const user = userEvent.setup();
      const limitedStockProduct = { ...mockProduct, stock: 2 };
      render(<ProductDetail product={limitedStockProduct} />);

      const increaseButton = screen.getByTestId("increase-quantity");

      // Increase to max stock
      await user.click(increaseButton);

      expect(increaseButton).toBeDisabled();
    });
  });

  describe("Add to Cart", () => {
    it("should render add to cart button for in-stock products", () => {
      render(<ProductDetail product={mockProduct} />);
      expect(screen.getByTestId("add-to-cart-button")).toBeInTheDocument();
    });

    it("should not render add to cart button for out-of-stock products", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductDetail product={outOfStockProduct} />);
      expect(
        screen.queryByTestId("add-to-cart-button"),
      ).not.toBeInTheDocument();
    });

    it("should call addItem with correct product ID and quantity when clicked", async () => {
      const user = userEvent.setup();
      mockAddItem.mockResolvedValue(undefined);

      render(<ProductDetail product={mockProduct} />);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(1, 1);
      });
    });

    it("should call addItem with selected quantity", async () => {
      const user = userEvent.setup();
      mockAddItem.mockResolvedValue(undefined);

      render(<ProductDetail product={mockProduct} />);

      // Increase quantity to 3
      const increaseButton = screen.getByTestId("increase-quantity");
      await user.click(increaseButton);
      await user.click(increaseButton);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(1, 3);
      });
    });

    it("should show success notification when item is added", async () => {
      const user = userEvent.setup();
      mockAddItem.mockResolvedValue(undefined);

      render(<ProductDetail product={mockProduct} />);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Added 1 Test Product to cart",
        );
      });
    });

    it("should show error notification when add to cart fails", async () => {
      const user = userEvent.setup();
      mockAddItem.mockRejectedValue(new Error("Network error"));

      render(<ProductDetail product={mockProduct} />);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          "Failed to add item to cart. Please try again.",
        );
      });
    });

    it("should reset quantity to 1 after successful add to cart", async () => {
      const user = userEvent.setup();
      mockAddItem.mockResolvedValue(undefined);

      render(<ProductDetail product={mockProduct} />);

      // Increase quantity to 3
      const increaseButton = screen.getByTestId("increase-quantity");
      await user.click(increaseButton);
      await user.click(increaseButton);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      await waitFor(() => {
        const quantityInput = screen.getByTestId(
          "quantity-input",
        ) as HTMLInputElement;
        expect(quantityInput.value).toBe("1");
      });
    });

    it("should show loading state while adding to cart", async () => {
      const user = userEvent.setup();
      let resolveAddItem: () => void;
      const addItemPromise = new Promise<void>((resolve) => {
        resolveAddItem = resolve;
      });
      mockAddItem.mockReturnValue(addItemPromise);

      render(<ProductDetail product={mockProduct} />);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      // Should show loading text
      expect(screen.getByText(/Adding to Cart.../i)).toBeInTheDocument();

      // Resolve the promise
      resolveAddItem!();
      await waitFor(() => {
        expect(screen.getByText(/Add to Cart/i)).toBeInTheDocument();
      });
    });

    it("should disable button while adding to cart", async () => {
      const user = userEvent.setup();
      let resolveAddItem: () => void;
      const addItemPromise = new Promise<void>((resolve) => {
        resolveAddItem = resolve;
      });
      mockAddItem.mockReturnValue(addItemPromise);

      render(<ProductDetail product={mockProduct} />);

      const addToCartButton = screen.getByTestId("add-to-cart-button");
      await user.click(addToCartButton);

      // Button should be disabled
      expect(addToCartButton).toBeDisabled();

      // Resolve the promise
      resolveAddItem!();
      await waitFor(() => {
        expect(addToCartButton).not.toBeDisabled();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle product without category", () => {
      const productWithoutCategory = {
        ...mockProduct,
        category: undefined,
      };
      render(<ProductDetail product={productWithoutCategory} />);
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });

    it("should handle product with empty description", () => {
      const productWithEmptyDescription = {
        ...mockProduct,
        description: "",
      };
      render(<ProductDetail product={productWithEmptyDescription} />);
      expect(screen.getByTestId("product-description")).toHaveTextContent("");
    });

    it("should handle product with very high price", () => {
      const expensiveProduct = {
        ...mockProduct,
        price: 9999.99,
      };
      render(<ProductDetail product={expensiveProduct} />);
      expect(screen.getByTestId("product-price")).toHaveTextContent(
        "$9,999.99",
      );
    });

    it("should handle product with very high stock", () => {
      const highStockProduct = {
        ...mockProduct,
        stock: 1000,
      };
      render(<ProductDetail product={highStockProduct} />);
      expect(
        screen.getByText(/In Stock \(1000 available\)/i),
      ).toBeInTheDocument();
    });
  });
});
