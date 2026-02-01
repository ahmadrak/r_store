import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "../../types";
import type { ProductWithImages } from "../../api/products";

export interface ProductGridProps {
  products: Product[] | ProductWithImages[];
  isLoading?: boolean;
  onAddToCart?: (productId: number) => void;
}

const ProductSkeleton: React.FC = () => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full animate-pulse"
      data-testid="product-skeleton"
      role="status"
      aria-label="Loading product"
    >
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-300" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-300 rounded mb-2" />
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3" />

        {/* Price Skeleton */}
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-3" />

        {/* Stock Indicator Skeleton */}
        <div className="h-5 bg-gray-300 rounded w-1/2 mb-3" />

        {/* Button Skeleton */}
        <div className="h-10 bg-gray-300 rounded mt-auto" />
      </div>
    </div>
  );
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onAddToCart,
}) => {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="product-grid-loading"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4"
        data-testid="product-grid-empty"
        role="status"
      >
        <svg
          className="w-24 h-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Products Found
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          We couldn't find any products matching your criteria. Try adjusting
          your filters or check back later for new items.
        </p>
      </div>
    );
  }

  // Show product grid
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      data-testid="product-grid"
      role="list"
      aria-label="Product list"
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          role="listitem"
          className="animate-fadeIn"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
