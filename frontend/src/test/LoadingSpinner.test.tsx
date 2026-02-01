import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

describe("LoadingSpinner", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("role", "status");
      expect(spinner).toHaveAttribute("aria-live", "polite");
      expect(spinner).toHaveAttribute("aria-busy", "true");
    });

    it("should render screen reader text", () => {
      render(<LoadingSpinner />);

      const srText = screen.getByText("Loading...");
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass("sr-only");
    });

    it("should have proper accessibility attributes", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole("status");
      expect(spinner).toHaveAttribute("aria-live", "polite");
      expect(spinner).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Size Variants", () => {
    it("should render small size spinner", () => {
      const { container } = render(<LoadingSpinner size="sm" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("h-4");
      expect(spinnerDiv).toHaveClass("w-4");
      expect(spinnerDiv).toHaveClass("border-2");
    });

    it("should render medium size spinner (default)", () => {
      const { container } = render(<LoadingSpinner size="md" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("h-8");
      expect(spinnerDiv).toHaveClass("w-8");
      expect(spinnerDiv).toHaveClass("border-2");
    });

    it("should render large size spinner", () => {
      const { container } = render(<LoadingSpinner size="lg" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("h-12");
      expect(spinnerDiv).toHaveClass("w-12");
      expect(spinnerDiv).toHaveClass("border-3");
    });

    it("should render extra large size spinner", () => {
      const { container } = render(<LoadingSpinner size="xl" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("h-16");
      expect(spinnerDiv).toHaveClass("w-16");
      expect(spinnerDiv).toHaveClass("border-4");
    });
  });

  describe("Color Variants", () => {
    it("should render blue spinner (default)", () => {
      const { container } = render(<LoadingSpinner color="blue" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("border-blue-600");
    });

    it("should render white spinner", () => {
      const { container } = render(<LoadingSpinner color="white" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("border-white");
    });

    it("should render gray spinner", () => {
      const { container } = render(<LoadingSpinner color="gray" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("border-gray-600");
    });

    it("should render red spinner", () => {
      const { container } = render(<LoadingSpinner color="red" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("border-red-600");
    });

    it("should render green spinner", () => {
      const { container } = render(<LoadingSpinner color="green" />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("border-green-600");
    });
  });

  describe("Loading Text", () => {
    it("should not render text by default", () => {
      render(<LoadingSpinner />);

      const text = screen.queryByTestId("loading-text");
      expect(text).not.toBeInTheDocument();
    });

    it("should render custom loading text when provided", () => {
      render(<LoadingSpinner text="Loading products..." />);

      const text = screen.getByTestId("loading-text");
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent("Loading products...");
    });

    it("should render text with appropriate size for small spinner", () => {
      render(<LoadingSpinner size="sm" text="Loading..." />);

      const text = screen.getByTestId("loading-text");
      expect(text).toHaveClass("text-sm");
    });

    it("should render text with appropriate size for medium spinner", () => {
      render(<LoadingSpinner size="md" text="Loading..." />);

      const text = screen.getByTestId("loading-text");
      expect(text).toHaveClass("text-base");
    });

    it("should render text with appropriate size for large spinner", () => {
      render(<LoadingSpinner size="lg" text="Loading..." />);

      const text = screen.getByTestId("loading-text");
      expect(text).toHaveClass("text-lg");
    });

    it("should render text with appropriate size for extra large spinner", () => {
      render(<LoadingSpinner size="xl" text="Loading..." />);

      const text = screen.getByTestId("loading-text");
      expect(text).toHaveClass("text-xl");
    });
  });

  describe("Centering", () => {
    it("should not center by default", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("flex");
      expect(spinner).toHaveClass("flex-col");
      expect(spinner).toHaveClass("items-center");
      expect(spinner).not.toHaveClass("justify-center");
    });

    it("should center when centered prop is true", () => {
      render(<LoadingSpinner centered />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("flex");
      expect(spinner).toHaveClass("flex-col");
      expect(spinner).toHaveClass("items-center");
      expect(spinner).toHaveClass("justify-center");
    });
  });

  describe("Custom Classes", () => {
    it("should apply custom className", () => {
      render(<LoadingSpinner className="my-custom-class" />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("my-custom-class");
    });

    it("should preserve default classes when custom className is added", () => {
      render(<LoadingSpinner className="my-custom-class" />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("flex");
      expect(spinner).toHaveClass("flex-col");
      expect(spinner).toHaveClass("items-center");
      expect(spinner).toHaveClass("my-custom-class");
    });
  });

  describe("Animation", () => {
    it("should have animate-spin class", () => {
      const { container } = render(<LoadingSpinner />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toBeInTheDocument();
    });

    it("should have rounded-full class for circular shape", () => {
      const { container } = render(<LoadingSpinner />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("rounded-full");
    });

    it("should have border-t-transparent for spinner effect", () => {
      const { container } = render(<LoadingSpinner />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("border-t-transparent");
    });

    it("should have aria-hidden on spinner div", () => {
      const { container } = render(<LoadingSpinner />);

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string text", () => {
      render(<LoadingSpinner text="" />);

      // Empty string is falsy, so text element should not render
      const text = screen.queryByTestId("loading-text");
      expect(text).not.toBeInTheDocument();
    });

    it("should handle very long text", () => {
      const longText =
        "Loading a very long text that might wrap to multiple lines in the UI...";
      render(<LoadingSpinner text={longText} />);

      const text = screen.getByTestId("loading-text");
      expect(text).toHaveTextContent(longText);
    });

    it("should handle multiple custom classes", () => {
      render(<LoadingSpinner className="class1 class2 class3" />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("class1");
      expect(spinner).toHaveClass("class2");
      expect(spinner).toHaveClass("class3");
    });
  });

  describe("Combination Props", () => {
    it("should handle all props together", () => {
      const { container } = render(
        <LoadingSpinner
          size="lg"
          color="green"
          text="Loading data..."
          centered
          className="custom-spinner"
        />,
      );

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("justify-center");
      expect(spinner).toHaveClass("custom-spinner");

      const spinnerDiv = container.querySelector(".animate-spin");
      expect(spinnerDiv).toHaveClass("h-12");
      expect(spinnerDiv).toHaveClass("w-12");
      expect(spinnerDiv).toHaveClass("border-green-600");

      const text = screen.getByTestId("loading-text");
      expect(text).toHaveTextContent("Loading data...");
      expect(text).toHaveClass("text-lg");
    });
  });
});
