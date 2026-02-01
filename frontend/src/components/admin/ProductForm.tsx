import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import type { Category } from "../../types";
import type { ProductWithImages } from "../../api/products";

/**
 * Product form validation schema
 */
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
  category_id: z.number().positive("Please select a category"),
});

/**
 * Product form data type
 */
export type ProductFormData = z.infer<typeof productFormSchema>;

/**
 * ProductForm Props
 */
export interface ProductFormProps {
  /** Product to edit (undefined for create mode) */
  product?: ProductWithImages;
  /** Available categories for selection */
  categories: Category[];
  /** Callback when form is submitted */
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether the form is in a loading/submitting state */
  loading?: boolean;
}

/**
 * ProductForm Component
 *
 * A form component for creating and editing products in the admin panel.
 * Supports both create and edit modes with form validation using React Hook Form and Zod.
 *
 * Features:
 * - Create mode: Empty form for new products
 * - Edit mode: Pre-filled form with existing product data
 * - Form validation with inline error messages
 * - Category selection dropdown
 * - Loading state during submission
 * - Cancel button to abort operation
 * - Accessible with proper ARIA attributes
 * - Type-safe with TypeScript and Zod
 *
 * Requirements: 6.2, 6.4
 *
 * @example
 * ```tsx
 * // Create mode
 * <ProductForm
 *   categories={categories}
 *   onSubmit={handleCreate}
 *   onCancel={() => setShowForm(false)}
 * />
 *
 * // Edit mode
 * <ProductForm
 *   product={selectedProduct}
 *   categories={categories}
 *   onSubmit={handleUpdate}
 *   onCancel={() => setShowForm(false)}
 *   loading={isUpdating}
 * />
 * ```
 */
export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEditMode = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category_id: 0,
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("description", product.description);
      setValue("price", product.price);
      setValue("stock", product.stock);
      setValue("category_id", product.category_id);
    }
  }, [product, setValue]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      data-testid="product-form"
    >
      {/* Product Name */}
      <Input
        label="Product Name"
        type="text"
        required
        {...register("name")}
        error={errors.name?.message}
        disabled={loading}
        fullWidth
        data-testid="product-name-input"
      />

      {/* Description */}
      <div data-testid="product-description-container">
        <label
          htmlFor="description"
          className="block font-medium text-gray-700 mb-1.5 text-base"
        >
          Description
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        </label>
        <textarea
          id="description"
          {...register("description")}
          disabled={loading}
          rows={4}
          className={`
            block w-full rounded-lg border transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            px-4 py-2 text-base
            ${
              errors.description
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
          `.trim()}
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          data-testid="product-description-input"
        />
        {errors.description && (
          <p
            id="description-error"
            className="mt-1.5 text-red-600 text-sm"
            role="alert"
            data-testid="product-description-error"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price */}
      <Input
        label="Price"
        type="number"
        step="0.01"
        min="0"
        required
        {...register("price", { valueAsNumber: true })}
        error={errors.price?.message}
        disabled={loading}
        fullWidth
        data-testid="product-price-input"
      />

      {/* Stock */}
      <Input
        label="Stock"
        type="number"
        min="0"
        required
        {...register("stock", { valueAsNumber: true })}
        error={errors.stock?.message}
        disabled={loading}
        fullWidth
        data-testid="product-stock-input"
      />

      {/* Category */}
      <div data-testid="product-category-container">
        <label
          htmlFor="category_id"
          className="block font-medium text-gray-700 mb-1.5 text-base"
        >
          Category
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        </label>
        <select
          id="category_id"
          {...register("category_id", { valueAsNumber: true })}
          disabled={loading}
          className={`
            block w-full rounded-lg border transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            px-4 py-2 text-base
            ${
              errors.category_id
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
          `.trim()}
          aria-invalid={errors.category_id ? "true" : "false"}
          aria-describedby={
            errors.category_id ? "category_id-error" : undefined
          }
          data-testid="product-category-input"
        >
          <option value={0}>Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p
            id="category_id-error"
            className="mt-1.5 text-red-600 text-sm"
            role="alert"
            data-testid="product-category-error"
          >
            {errors.category_id.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          data-testid="product-form-cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          data-testid="product-form-submit"
        >
          {isEditMode ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
