import React, { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { ProductGrid } from "../components/product/ProductGrid";
import CategoryFilter from "../components/product/CategoryFilter";

const Home: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(selectedCategoryId ?? undefined);

  const { data: categories = [], error: categoriesError } = useCategories();

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to Our Store
        </h1>
        <p className="text-lg text-gray-600">
          Discover our amazing collection of products
        </p>
      </div>

      {/* Category Filter Section */}
      {categoriesError ? (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          role="alert"
        >
          <p className="font-medium">Failed to load categories</p>
          <p className="text-sm">{categoriesError.message}</p>
        </div>
      ) : (
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Products Section */}
      {productsError ? (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center"
          role="alert"
        >
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">
            Failed to Load Products
          </h3>
          <p className="text-sm mb-4">
            {productsError.message ||
              "We couldn't load the products. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <ProductGrid products={products} isLoading={productsLoading} />
      )}
    </div>
  );
};

export default Home;
