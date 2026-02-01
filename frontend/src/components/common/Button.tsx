import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  children,
  type = "button",
  ...rest
}) => {
  // Base classes for all buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95";

  // Variant classes mapping
  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200",
    outline:
      "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100",
  };

  // Size classes mapping
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  // Loading spinner size mapping
  const spinnerSizeMap = {
    sm: "sm" as const,
    md: "sm" as const,
    lg: "md" as const,
  };

  // Loading spinner color mapping based on variant
  const spinnerColorMap = {
    primary: "white" as const,
    secondary: "gray" as const,
    danger: "white" as const,
    ghost: "gray" as const,
    outline: "gray" as const,
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClasses}
    ${className}
  `.trim();

  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      aria-busy={loading}
      data-testid="button"
      {...rest}
    >
      {/* Loading spinner */}
      {loading && (
        <LoadingSpinner
          size={spinnerSizeMap[size]}
          color={spinnerColorMap[variant]}
          data-testid="button-spinner"
        />
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className="flex-shrink-0" data-testid="button-left-icon">
          {leftIcon}
        </span>
      )}

      {/* Button text */}
      {children && <span>{children}</span>}

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className="flex-shrink-0" data-testid="button-right-icon">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
