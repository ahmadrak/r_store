import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../components/common/Input";
import { useRef } from "react";

describe("Input", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("should render without label", () => {
      render(<Input />);

      const label = screen.queryByTestId("input-label");
      expect(label).not.toBeInTheDocument();
    });

    it("should have proper accessibility attributes", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("should generate unique ID when not provided", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("id");
      expect(input.getAttribute("id")).toMatch(/^input-/);
    });

    it("should use provided ID", () => {
      render(<Input id="custom-id" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Label", () => {
    it("should render label when provided", () => {
      render(<Input label="Email Address" />);

      const label = screen.getByTestId("input-label");
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("Email Address");
    });

    it("should associate label with input", () => {
      render(<Input label="Email" id="email-input" />);

      const label = screen.getByTestId("input-label");
      const input = screen.getByTestId("input");

      expect(label).toHaveAttribute("for", "email-input");
      expect(input).toHaveAttribute("id", "email-input");
    });

    it("should not show required indicator by default", () => {
      render(<Input label="Email" />);

      const required = screen.queryByTestId("input-required");
      expect(required).not.toBeInTheDocument();
    });

    it("should show required indicator when required is true", () => {
      render(<Input label="Email" required />);

      const required = screen.getByTestId("input-required");
      expect(required).toBeInTheDocument();
      expect(required).toHaveTextContent("*");
      expect(required).toHaveClass("text-red-500");
    });

    it("should have proper label styling", () => {
      render(<Input label="Email" />);

      const label = screen.getByTestId("input-label");
      expect(label).toHaveClass("block");
      expect(label).toHaveClass("font-medium");
      expect(label).toHaveClass("text-gray-700");
    });

    it("should apply custom label className", () => {
      render(<Input label="Email" labelClassName="custom-label" />);

      const label = screen.getByTestId("input-label");
      expect(label).toHaveClass("custom-label");
    });
  });

  describe("Input Types", () => {
    it("should render text input by default", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "text");
    });

    it("should render email input", () => {
      render(<Input type="email" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "email");
    });

    it("should render password input", () => {
      render(<Input type="password" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should render number input", () => {
      render(<Input type="number" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  describe("Size Variants", () => {
    it("should render small size input", () => {
      render(<Input size="sm" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("px-3");
      expect(input).toHaveClass("py-1.5");
      expect(input).toHaveClass("text-sm");
    });

    it("should render medium size input (default)", () => {
      render(<Input size="md" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("px-4");
      expect(input).toHaveClass("py-2");
      expect(input).toHaveClass("text-base");
    });

    it("should render large size input", () => {
      render(<Input size="lg" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("px-5");
      expect(input).toHaveClass("py-3");
      expect(input).toHaveClass("text-lg");
    });

    it("should render small label for small input", () => {
      render(<Input label="Email" size="sm" />);

      const label = screen.getByTestId("input-label");
      expect(label).toHaveClass("text-sm");
    });

    it("should render medium label for medium input", () => {
      render(<Input label="Email" size="md" />);

      const label = screen.getByTestId("input-label");
      expect(label).toHaveClass("text-base");
    });

    it("should render large label for large input", () => {
      render(<Input label="Email" size="lg" />);

      const label = screen.getByTestId("input-label");
      expect(label).toHaveClass("text-lg");
    });
  });

  describe("Error State", () => {
    it("should not show error by default", () => {
      render(<Input />);

      const error = screen.queryByTestId("input-error");
      expect(error).not.toBeInTheDocument();
    });

    it("should show error message when provided", () => {
      render(<Input error="This field is required" />);

      const error = screen.getByTestId("input-error");
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent("This field is required");
    });

    it("should have error styling when error is present", () => {
      render(<Input error="Invalid input" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("border-red-500");
      expect(input).toHaveClass("focus:border-red-500");
      expect(input).toHaveClass("focus:ring-red-500");
    });

    it("should have normal styling when no error", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("border-gray-300");
      expect(input).toHaveClass("focus:border-blue-500");
      expect(input).toHaveClass("focus:ring-blue-500");
    });

    it("should set aria-invalid when error is present", () => {
      render(<Input error="Invalid input" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should set aria-describedby when error is present", () => {
      render(<Input id="email" error="Invalid email" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("aria-describedby", "email-error");
    });

    it("should have role alert on error message", () => {
      render(<Input error="Invalid input" />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveAttribute("role", "alert");
    });

    it("should have proper error styling", () => {
      render(<Input error="Invalid input" />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveClass("text-red-600");
      expect(error).toHaveClass("mt-1.5");
    });

    it("should apply custom error className", () => {
      render(<Input error="Invalid input" errorClassName="custom-error" />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveClass("custom-error");
    });

    it("should render small error text for small input", () => {
      render(<Input size="sm" error="Error" />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveClass("text-xs");
    });

    it("should render medium error text for medium input", () => {
      render(<Input size="md" error="Error" />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveClass("text-sm");
    });

    it("should render large error text for large input", () => {
      render(<Input size="lg" error="Error" />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveClass("text-base");
    });
  });

  describe("Disabled State", () => {
    it("should not be disabled by default", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).not.toBeDisabled();
    });

    it("should be disabled when disabled prop is true", () => {
      render(<Input disabled />);

      const input = screen.getByTestId("input");
      expect(input).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<Input disabled />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("disabled:opacity-50");
      expect(input).toHaveClass("disabled:cursor-not-allowed");
      expect(input).toHaveClass("disabled:bg-gray-50");
    });
  });

  describe("Required State", () => {
    it("should not be required by default", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).not.toHaveAttribute("required");
    });

    it("should be required when required prop is true", () => {
      render(<Input required />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("required");
    });

    it("should show required indicator in label when required", () => {
      render(<Input label="Email" required />);

      const required = screen.getByTestId("input-required");
      expect(required).toBeInTheDocument();
      expect(required).toHaveAttribute("aria-label", "required");
    });
  });

  describe("Full Width", () => {
    it("should not be full width by default", () => {
      render(<Input />);

      const container = screen.getByTestId("input-container");
      expect(container).not.toHaveClass("w-full");
    });

    it("should be full width when fullWidth is true", () => {
      render(<Input fullWidth />);

      const container = screen.getByTestId("input-container");
      expect(container).toHaveClass("w-full");
    });

    it("should always have w-full on input element", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("w-full");
    });
  });

  describe("Custom Classes", () => {
    it("should apply custom className to input", () => {
      render(<Input className="custom-input" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("custom-input");
    });

    it("should apply custom containerClassName", () => {
      render(<Input containerClassName="custom-container" />);

      const container = screen.getByTestId("input-container");
      expect(container).toHaveClass("custom-container");
    });

    it("should preserve default classes when custom className is added", () => {
      render(<Input className="custom-input" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("block");
      expect(input).toHaveClass("rounded-lg");
      expect(input).toHaveClass("border");
      expect(input).toHaveClass("custom-input");
    });
  });

  describe("Value and onChange", () => {
    it("should render with initial value", () => {
      render(<Input value="test value" onChange={() => {}} />);

      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(input.value).toBe("test value");
    });

    it("should call onChange when value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);

      const input = screen.getByTestId("input");
      await user.type(input, "test");

      expect(handleChange).toHaveBeenCalled();
    });

    it("should update value when typing", async () => {
      const user = userEvent.setup();

      render(<Input />);

      const input = screen.getByTestId("input") as HTMLInputElement;
      await user.type(input, "hello");

      expect(input.value).toBe("hello");
    });
  });

  describe("Placeholder", () => {
    it("should render with placeholder", () => {
      render(<Input placeholder="Enter your email" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("placeholder", "Enter your email");
    });

    it("should show placeholder text", () => {
      render(<Input placeholder="Enter your email" />);

      const input = screen.getByPlaceholderText("Enter your email");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Native Input Attributes", () => {
    it("should support name attribute", () => {
      render(<Input name="email" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("name", "email");
    });

    it("should support autoComplete attribute", () => {
      render(<Input autoComplete="email" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("autoComplete", "email");
    });

    it("should support maxLength attribute", () => {
      render(<Input maxLength={50} />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("maxLength", "50");
    });

    it("should support minLength attribute", () => {
      render(<Input minLength={6} />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("minLength", "6");
    });

    it("should support pattern attribute", () => {
      render(<Input pattern="[0-9]*" />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("pattern", "[0-9]*");
    });

    it("should support min attribute for number input", () => {
      render(<Input type="number" min={0} />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("min", "0");
    });

    it("should support max attribute for number input", () => {
      render(<Input type="number" max={100} />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("max", "100");
    });

    it("should support step attribute for number input", () => {
      render(<Input type="number" step={0.01} />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("step", "0.01");
    });

    it("should support readOnly attribute", () => {
      render(<Input readOnly />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("readOnly");
    });

    it("should support aria-label attribute", () => {
      render(<Input aria-label="Email address" />);

      const input = screen.getByLabelText("Email address");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Focus and Keyboard Interaction", () => {
    it("should be focusable", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      input.focus();

      expect(input).toHaveFocus();
    });

    it("should not be focusable when disabled", () => {
      render(<Input disabled />);

      const input = screen.getByTestId("input");
      input.focus();

      expect(input).not.toHaveFocus();
    });

    it("should have focus ring classes", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("focus:outline-none");
      expect(input).toHaveClass("focus:ring-2");
      expect(input).toHaveClass("focus:ring-offset-1");
    });

    it("should accept keyboard input", async () => {
      const user = userEvent.setup();

      render(<Input />);

      const input = screen.getByTestId("input") as HTMLInputElement;
      await user.type(input, "test input");

      expect(input.value).toBe("test input");
    });
  });

  describe("Ref Forwarding", () => {
    it("should forward ref to input element", () => {
      const TestComponent = () => {
        const inputRef = useRef<HTMLInputElement>(null);

        return (
          <div>
            <Input ref={inputRef} />
            <button onClick={() => inputRef.current?.focus()}>
              Focus Input
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const input = screen.getByTestId("input");
      const button = screen.getByText("Focus Input");

      expect(input).not.toHaveFocus();

      button.click();

      expect(input).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string label", () => {
      render(<Input label="" />);

      // Empty string is falsy, so label element should not render
      const label = screen.queryByTestId("input-label");
      expect(label).not.toBeInTheDocument();
    });

    it("should handle empty string error", () => {
      render(<Input error="" />);

      // Empty string is falsy, so error element should not render
      const error = screen.queryByTestId("input-error");
      expect(error).not.toBeInTheDocument();
    });

    it("should handle very long label text", () => {
      const longLabel =
        "This is a very long label that might wrap to multiple lines";
      render(<Input label={longLabel} />);

      const label = screen.getByTestId("input-label");
      expect(label).toHaveTextContent(longLabel);
    });

    it("should handle very long error text", () => {
      const longError =
        "This is a very long error message that might wrap to multiple lines in the UI";
      render(<Input error={longError} />);

      const error = screen.getByTestId("input-error");
      expect(error).toHaveTextContent(longError);
    });

    it("should handle null value gracefully", () => {
      render(<Input value={undefined} />);

      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("Combination Props", () => {
    it("should handle all props together", () => {
      render(
        <Input
          label="Email Address"
          type="email"
          size="lg"
          fullWidth
          required
          error="Please enter a valid email"
          placeholder="you@example.com"
          className="custom-input"
          containerClassName="custom-container"
          labelClassName="custom-label"
          errorClassName="custom-error"
        />,
      );

      const container = screen.getByTestId("input-container");
      expect(container).toHaveClass("w-full");
      expect(container).toHaveClass("custom-container");

      const label = screen.getByTestId("input-label");
      expect(label).toHaveTextContent("Email Address");
      expect(label).toHaveClass("text-lg");
      expect(label).toHaveClass("custom-label");

      const required = screen.getByTestId("input-required");
      expect(required).toBeInTheDocument();

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveClass("px-5");
      expect(input).toHaveClass("py-3");
      expect(input).toHaveClass("text-lg");
      expect(input).toHaveClass("border-red-500");
      expect(input).toHaveClass("custom-input");
      expect(input).toHaveAttribute("placeholder", "you@example.com");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-invalid", "true");

      const error = screen.getByTestId("input-error");
      expect(error).toHaveTextContent("Please enter a valid email");
      expect(error).toHaveClass("text-base");
      expect(error).toHaveClass("custom-error");
    });

    it("should handle disabled with error", () => {
      render(<Input disabled error="This field is required" />);

      const input = screen.getByTestId("input");
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("aria-invalid", "true");

      const error = screen.getByTestId("input-error");
      expect(error).toBeInTheDocument();
    });

    it("should handle required with disabled", () => {
      render(<Input label="Email" required disabled />);

      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("required");
      expect(input).toBeDisabled();

      const required = screen.getByTestId("input-required");
      expect(required).toBeInTheDocument();
    });
  });

  describe("Transition Classes", () => {
    it("should have transition classes", () => {
      render(<Input />);

      const input = screen.getByTestId("input");
      expect(input).toHaveClass("transition-colors");
    });
  });
});
