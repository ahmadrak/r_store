import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import type { Category } from "../../types";

/**
 * Category form validation schema
 */
const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

/**
 * Category form data type
 */
export type CategoryFormData = z.infer<typeof categoryFormSchema>;

/**
 * CategoryForm Props
 */
export interface CategoryFormProps {
  /** Category to edit (undefined for create mode) */
  category?: Category;
  /** Callback when form is submitted */
  onSubmit: (data: CategoryFormData) => void | Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether the form is in a loading/submitting state */
  loading?: boolean;
}

/**
 * CategoryForm Component
 *
 * A form component for creating and editing categories in the admin panel.
 * Supports both create and edit modes with form validation using React Hook Form and Zod.
 *
 * Features:
 * - Create mode: Empty form for new categories
 * - Edit mode: Pre-filled form with existing category data
 * - Form validation with inline error messages
 * - Loading state during submission
 * - Cancel button to abort operation
 * - Accessible with proper ARIA attributes
 * - Type-safe with TypeScript and Zod
 *
 * Requirements: 7.2, 7.4
 *
 * @example
 * ```tsx
 * // Create mode
 * <CategoryForm
 *   onSubmit={handleCreate}
 *   onCancel={() => setShowForm(false)}
 * />
 *
 * // Edit mode
 * <CategoryForm
 *   category={selectedCategory}
 *   onSubmit={handleUpdate}
 *   onCancel={() => setShowForm(false)}
 *   loading={isUpdating}
 * />
 * ```
 */
export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEditMode = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (category) {
      setValue("name", category.name);
    }
  }, [category, setValue]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      data-testid="category-form"
    >
      {/* Category Name */}
      <Input
        label="Category Name"
        type="text"
        required
        {...register("name")}
        error={errors.name?.message}
        disabled={loading}
        fullWidth
        data-testid="category-name-input"
      />

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          data-testid="category-form-cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          data-testid="category-form-submit"
        >
          {isEditMode ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
