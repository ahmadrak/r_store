import React from "react";
import type { Category } from "../../types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {/* All Products option */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategoryId === null
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-pressed={selectedCategoryId === null}
          aria-label="Show all products"
        >
          All Products
        </button>

        {/* Category buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategoryId === category.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-pressed={selectedCategoryId === category.id}
            aria-label={`Filter by ${category.name}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
