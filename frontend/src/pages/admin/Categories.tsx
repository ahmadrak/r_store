import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategories } from "../../hooks/useCategories";
import { categoriesApi } from "../../api/categories";
import type { Category } from "../../types";
import type { CategoryFormData } from "../../components/admin/CategoryForm";
import { CategoryTable } from "../../components/admin/CategoryTable";
import { CategoryForm } from "../../components/admin/CategoryForm";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * AdminCategories Page
 *
 * Admin page for managing categories in the catalog.
 * Provides functionality to create, update, and delete categories.
 *
 * Features:
 * - Display all categories in a table
 * - Create new categories with a form modal
 * - Edit existing categories with pre-filled form
 * - Delete categories with confirmation dialog
 * - Success notifications for all operations
 * - Loading and error states
 * - Automatic data refresh after mutations
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */
const AdminCategories: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  // Fetch categories
  const { data: categories = [], isLoading, error } = useCategories();

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showSuccess("Category created successfully");
      setShowForm(false);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to create category");
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showSuccess("Category updated successfully");
      setShowForm(false);
      setEditingCategory(null);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to update category");
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showSuccess("Category deleted successfully");
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to delete category");
    },
  });

  // Handle create button click
  const handleCreateClick = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  // Handle delete
  const handleDelete = (categoryId: number) => {
    deleteMutation.mutate(categoryId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load categories. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
        <Button
          variant="primary"
          onClick={handleCreateClick}
          data-testid="create-category-button"
        >
          Create Category
        </Button>
      </div>

      {/* Categories Table */}
      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* Category Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingCategory ? "Edit Category" : "Create Category"}
        closeOnBackdropClick={false}
        data-testid="category-form-modal"
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={isFormLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminCategories;
