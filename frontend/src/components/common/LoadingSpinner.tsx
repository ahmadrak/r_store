import React from "react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" | "gray" | "red" | "green";
  text?: string;
  centered?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  text,
  centered = false,
  className = "",
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  // Color classes mapping
  const colorClasses = {
    blue: "border-blue-600",
    white: "border-white",
    gray: "border-gray-600",
    red: "border-red-600",
    green: "border-green-600",
  };

  // Text size classes based on spinner size
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Container classes
  const containerClasses = centered
    ? "flex flex-col items-center justify-center"
    : "flex flex-col items-center";

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="loading-spinner"
    >
      {/* Spinner */}
      <div
        className={`
          animate-spin rounded-full
          border-t-transparent
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        aria-hidden="true"
      />

      {/* Loading text */}
      {text && (
        <p
          className={`mt-3 text-gray-600 ${textSizeClasses[size]}`}
          data-testid="loading-text"
        >
          {text}
        </p>
      )}

      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
