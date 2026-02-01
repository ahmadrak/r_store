import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/common/Button";

describe("Button", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should render without children", () => {
      render(<Button />);

      const button = screen.getByTestId("button");
      expect(button).toBeInTheDocument();
    });

    it("should have proper accessibility attributes", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should support custom type attribute", () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("Variant Styles", () => {
    it("should render primary variant (default)", () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("bg-blue-600");
      expect(button).toHaveClass("text-white");
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("bg-gray-200");
      expect(button).toHaveClass("text-gray-900");
    });

    it("should render danger variant", () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("bg-red-600");
      expect(button).toHaveClass("text-white");
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("text-gray-700");
    });

    it("should render outline variant", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("border-2");
      expect(button).toHaveClass("border-gray-300");
    });
  });

  describe("Size Variants", () => {
    it("should render small size button", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("px-3");
      expect(button).toHaveClass("py-1.5");
      expect(button).toHaveClass("text-sm");
    });

    it("should render medium size button (default)", () => {
      render(<Button size="md">Medium</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("px-4");
      expect(button).toHaveClass("py-2");
      expect(button).toHaveClass("text-base");
    });

    it("should render large size button", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("py-3");
      expect(button).toHaveClass("text-lg");
    });
  });

  describe("Loading State", () => {
    it("should not show loading spinner by default", () => {
      render(<Button>Click me</Button>);

      const spinner = screen.queryByTestId("loading-spinner");
      expect(spinner).not.toBeInTheDocument();
    });

    it("should show loading spinner when loading is true", () => {
      render(<Button loading>Loading...</Button>);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should disable button when loading", () => {
      render(<Button loading>Loading...</Button>);

      const button = screen.getByTestId("button");
      expect(button).toBeDisabled();
    });

    it("should set aria-busy when loading", () => {
      render(<Button loading>Loading...</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("should hide icons when loading", () => {
      render(
        <Button
          loading
          leftIcon={<span>Left</span>}
          rightIcon={<span>Right</span>}
        >
          Loading...
        </Button>,
      );

      const leftIcon = screen.queryByTestId("button-left-icon");
      const rightIcon = screen.queryByTestId("button-right-icon");

      expect(leftIcon).not.toBeInTheDocument();
      expect(rightIcon).not.toBeInTheDocument();
    });

    it("should show correct spinner size for small button", () => {
      const { container } = render(
        <Button size="sm" loading>
          Loading...
        </Button>,
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-4"); // sm spinner
    });

    it("should show correct spinner size for medium button", () => {
      const { container } = render(
        <Button size="md" loading>
          Loading...
        </Button>,
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-4"); // sm spinner
    });

    it("should show correct spinner size for large button", () => {
      const { container } = render(
        <Button size="lg" loading>
          Loading...
        </Button>,
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-8"); // md spinner
    });

    it("should show white spinner for primary variant", () => {
      const { container } = render(
        <Button variant="primary" loading>
          Loading...
        </Button>,
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-white");
    });

    it("should show gray spinner for secondary variant", () => {
      const { container } = render(
        <Button variant="secondary" loading>
          Loading...
        </Button>,
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-gray-600");
    });
  });

  describe("Disabled State", () => {
    it("should not be disabled by default", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).not.toBeDisabled();
    });

    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByTestId("button");
      expect(button).toBeDisabled();
    });

    it("should have reduced opacity when disabled", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("disabled:opacity-50");
    });

    it("should have not-allowed cursor when disabled", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("Full Width", () => {
    it("should not be full width by default", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).not.toHaveClass("w-full");
    });

    it("should be full width when fullWidth is true", () => {
      render(<Button fullWidth>Full Width</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("w-full");
    });
  });

  describe("Icons", () => {
    it("should not render icons by default", () => {
      render(<Button>Click me</Button>);

      const leftIcon = screen.queryByTestId("button-left-icon");
      const rightIcon = screen.queryByTestId("button-right-icon");

      expect(leftIcon).not.toBeInTheDocument();
      expect(rightIcon).not.toBeInTheDocument();
    });

    it("should render left icon when provided", () => {
      render(<Button leftIcon={<span>←</span>}>Back</Button>);

      const leftIcon = screen.getByTestId("button-left-icon");
      expect(leftIcon).toBeInTheDocument();
      expect(leftIcon).toHaveTextContent("←");
    });

    it("should render right icon when provided", () => {
      render(<Button rightIcon={<span>→</span>}>Next</Button>);

      const rightIcon = screen.getByTestId("button-right-icon");
      expect(rightIcon).toBeInTheDocument();
      expect(rightIcon).toHaveTextContent("→");
    });

    it("should render both left and right icons", () => {
      render(
        <Button leftIcon={<span>←</span>} rightIcon={<span>→</span>}>
          Both
        </Button>,
      );

      const leftIcon = screen.getByTestId("button-left-icon");
      const rightIcon = screen.getByTestId("button-right-icon");

      expect(leftIcon).toBeInTheDocument();
      expect(rightIcon).toBeInTheDocument();
    });

    it("should have flex-shrink-0 on icons", () => {
      render(<Button leftIcon={<span>←</span>}>Back</Button>);

      const leftIcon = screen.getByTestId("button-left-icon");
      expect(leftIcon).toHaveClass("flex-shrink-0");
    });
  });

  describe("Custom Classes", () => {
    it("should apply custom className", () => {
      render(<Button className="my-custom-class">Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("my-custom-class");
    });

    it("should preserve default classes when custom className is added", () => {
      render(<Button className="my-custom-class">Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("inline-flex");
      expect(button).toHaveClass("items-center");
      expect(button).toHaveClass("justify-center");
      expect(button).toHaveClass("my-custom-class");
    });
  });

  describe("Click Handling", () => {
    it("should call onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByTestId("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );

      const button = screen.getByTestId("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick} loading>
          Loading...
        </Button>,
      );

      const button = screen.getByTestId("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Native Button Attributes", () => {
    it("should support aria-label attribute", () => {
      render(<Button aria-label="Close dialog">×</Button>);

      const button = screen.getByLabelText("Close dialog");
      expect(button).toBeInTheDocument();
    });

    it("should support data attributes", () => {
      render(<Button data-custom="value">Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("data-custom", "value");
    });

    it("should support id attribute", () => {
      render(<Button id="my-button">Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("id", "my-button");
    });

    it("should support name attribute", () => {
      render(<Button name="submit-button">Submit</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveAttribute("name", "submit-button");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string children", () => {
      render(<Button>{""}</Button>);

      const button = screen.getByTestId("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      render(
        <Button>
          <span>Part 1</span>
          <span>Part 2</span>
        </Button>,
      );

      const button = screen.getByTestId("button");
      expect(button).toHaveTextContent("Part 1Part 2");
    });

    it("should handle numeric children", () => {
      render(<Button>{42}</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveTextContent("42");
    });

    it("should handle null icon gracefully", () => {
      render(<Button leftIcon={null}>Click me</Button>);

      const leftIcon = screen.queryByTestId("button-left-icon");
      expect(leftIcon).not.toBeInTheDocument();
    });
  });

  describe("Combination Props", () => {
    it("should handle all props together", () => {
      render(
        <Button
          variant="danger"
          size="lg"
          fullWidth
          leftIcon={<span>🗑️</span>}
          className="custom-delete-button"
          type="submit"
        >
          Delete Account
        </Button>,
      );

      const button = screen.getByTestId("button");

      // Variant
      expect(button).toHaveClass("bg-red-600");

      // Size
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("py-3");
      expect(button).toHaveClass("text-lg");

      // Full width
      expect(button).toHaveClass("w-full");

      // Custom class
      expect(button).toHaveClass("custom-delete-button");

      // Type
      expect(button).toHaveAttribute("type", "submit");

      // Icon
      const leftIcon = screen.getByTestId("button-left-icon");
      expect(leftIcon).toBeInTheDocument();

      // Text
      expect(button).toHaveTextContent("Delete Account");
    });

    it("should handle loading with all other props", () => {
      render(
        <Button
          variant="primary"
          size="sm"
          fullWidth
          loading
          leftIcon={<span>Icon</span>}
          className="loading-button"
        >
          Submitting...
        </Button>,
      );

      const button = screen.getByTestId("button");

      // Should be disabled
      expect(button).toBeDisabled();

      // Should have aria-busy
      expect(button).toHaveAttribute("aria-busy", "true");

      // Should show spinner
      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();

      // Should hide icon
      const leftIcon = screen.queryByTestId("button-left-icon");
      expect(leftIcon).not.toBeInTheDocument();

      // Should still have other classes
      expect(button).toHaveClass("w-full");
      expect(button).toHaveClass("loading-button");
    });
  });

  describe("Focus and Keyboard Interaction", () => {
    it("should be focusable", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId("button");
      button.focus();

      expect(button).toHaveFocus();
    });

    it("should not be focusable when disabled", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByTestId("button");
      button.focus();

      expect(button).not.toHaveFocus();
    });

    it("should have focus ring classes", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("focus:outline-none");
      expect(button).toHaveClass("focus:ring-2");
      expect(button).toHaveClass("focus:ring-offset-2");
    });

    it("should trigger onClick on Enter key", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByTestId("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should trigger onClick on Space key", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByTestId("button");
      button.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Transition Classes", () => {
    it("should have transition classes", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("transition-all");
      expect(button).toHaveClass("duration-200");
    });

    it("should have hover classes for primary variant", () => {
      render(<Button variant="primary">Hover me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("hover:bg-blue-700");
    });

    it("should have active classes for primary variant", () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByTestId("button");
      expect(button).toHaveClass("active:bg-blue-800");
    });
  });
});
