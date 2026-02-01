import React, { forwardRef } from "react";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      size = "md",
      fullWidth = false,
      required = false,
      className = "",
      containerClassName = "",
      labelClassName = "",
      errorClassName = "",
      id,
      type = "text",
      disabled,
      ...rest
    },
    ref,
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;

    // Base classes for all inputs
    const baseClasses =
      "block w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50";

    // Size classes mapping
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-5 py-3 text-lg",
    };

    // Border and focus classes based on error state
    const stateClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";

    // Width classes
    const widthClasses = fullWidth ? "w-full" : "";

    // Combine all input classes
    const inputClasses = `
      ${baseClasses}
      ${sizeClasses[size]}
      ${stateClasses}
      ${className}
    `.trim();

    // Label size classes
    const labelSizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    // Error message size classes
    const errorSizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <div
        className={`${widthClasses} ${containerClassName}`.trim()}
        data-testid="input-container"
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block font-medium text-gray-700 mb-1.5 ${labelSizeClasses[size]} ${labelClassName}`.trim()}
            data-testid="input-label"
          >
            {label}
            {required && (
              <span
                className="text-red-500 ml-1"
                aria-label="required"
                data-testid="input-required"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          data-testid="input"
          {...rest}
        />

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className={`mt-1.5 text-red-600 ${errorSizeClasses[size]} ${errorClassName}`.trim()}
            role="alert"
            data-testid="input-error"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
