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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-white shadow-xl sm:px-12 sm:py-20" aria-labelledby="store-heading">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">R-Store Collection</span>
          <h1 id="store-heading" className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Find something you’ll love.</h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">Explore our curated selection of products. Discover your next favorite, all in one place.</p>
          <a href="#shop-products" className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Shop collection <span aria-hidden="true" className="ml-2">→</span></a>
        </div>
      </section>
      <div id="shop-products" className="mb-6 scroll-mt-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Explore products</h2>
        <p className="mt-2 text-sm text-slate-600">Browse by category and find what fits your style.</p>
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
    </main>
  );
};

export default Home;
