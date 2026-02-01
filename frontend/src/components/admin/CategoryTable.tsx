import React, { useState } from "react";
import type { Category } from "../../types";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

/**
 * CategoryTable Props
 */
export interface CategoryTableProps {
  /** Array of categories to display */
  categories: Category[];
  /** Callback when edit button is clicked */
  onEdit: (category: Category) => void;
  /** Callback when delete is confirmed */
  onDelete: (categoryId: number) => void;
  /** Whether any operation is in progress */
  loading?: boolean;
}

/**
 * CategoryTable Component
 *
 * A table component for displaying and managing categories in the admin panel.
 * Provides edit and delete actions with confirmation dialog.
 *
 * Features:
 * - Edit action button for each category
 * - Delete action button with confirmation dialog
 * - Responsive table layout
 * - Loading state support
 * - Empty state message
 * - Accessible with proper ARIA attributes
 *
 * Requirements: 7.1, 7.6
 *
 * @example
 * ```tsx
 * <CategoryTable
 *   categories={categories}
 *   onEdit={(category) => setEditingCategory(category)}
 *   onDelete={(id) => handleDelete(id)}
 *   loading={isDeleting}
 * />
 * ```
 */
export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  // Handle delete button click
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      onDelete(categoryToDelete.id);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // Empty state
  if (categories.length === 0) {
    return (
      <div
        className="text-center py-12 bg-gray-50 rounded-lg"
        data-testid="category-table-empty"
      >
        <p className="text-gray-600">No categories found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto" data-testid="category-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* ID Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>

              {/* Name Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>

              {/* Actions Column */}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-gray-50"
                data-testid={`category-row-${category.id}`}
              >
                {/* ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{category.id}</div>
                </td>

                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {category.name}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(category)}
                      disabled={loading}
                      data-testid={`edit-category-${category.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(category)}
                      disabled={loading}
                      data-testid={`delete-category-${category.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Confirm Delete"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
              disabled={loading}
              data-testid="delete-cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={loading}
              data-testid="delete-confirm-button"
            >
              Delete
            </Button>
          </>
        }
        data-testid="delete-confirmation-modal"
      >
        <p className="text-gray-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{categoryToDelete?.name}</span>? This
          action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default CategoryTable;
