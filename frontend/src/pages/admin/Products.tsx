import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { productsApi } from "../../api/products";
import type { ProductWithImages } from "../../api/products";
import type { ProductFormData } from "../../components/admin/ProductForm";
import { ProductTable } from "../../components/admin/ProductTable";
import { ProductForm } from "../../components/admin/ProductForm";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * AdminProducts Page
 *
 * Admin page for managing products in the catalog.
 * Provides functionality to create, update, and delete products.
 *
 * Features:
 * - Display all products in a sortable table
 * - Create new products with a form modal
 * - Edit existing products with pre-filled form
 * - Delete products with confirmation dialog
 * - Success notifications for all operations
 * - Loading and error states
 * - Automatic data refresh after mutations
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
 */
const AdminProducts: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithImages | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  // Fetch products and categories
  const { data: products = [], isLoading, error } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Product created successfully");
      setShowForm(false);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to create product");
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Product updated successfully");
      setShowForm(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to update product");
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Product deleted successfully");
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Failed to delete product");
    },
  });

  // Handle create button click
  const handleCreateClick = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  // Handle edit button click
  const handleEdit = (product: ProductWithImages) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Handle delete
  const handleDelete = (productId: number) => {
    deleteMutation.mutate(productId);
  };

  // Loading state
  if (isLoading || categoriesLoading) {
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
            Failed to load products. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
        <Button
          variant="primary"
          onClick={handleCreateClick}
          data-testid="create-product-button"
        >
          Create Product
        </Button>
      </div>

      {/* Products Table */}
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* Product Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingProduct ? "Edit Product" : "Create Product"}
        size="lg"
        closeOnBackdropClick={false}
        data-testid="product-form-modal"
      >
        <ProductForm
          product={editingProduct || undefined}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={isFormLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminProducts;
