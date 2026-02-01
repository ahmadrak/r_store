import React, { useState } from "react";
import type { ProductWithImages } from "../../api/products";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";

/**
 * ProductTable Props
 */
export interface ProductTableProps {
  /** Array of products to display */
  products: ProductWithImages[];
  /** Callback when edit button is clicked */
  onEdit: (product: ProductWithImages) => void;
  /** Callback when delete is confirmed */
  onDelete: (productId: number) => void;
  /** Whether any operation is in progress */
  loading?: boolean;
}

/**
 * Sort configuration
 */
type SortField = "name" | "price" | "stock" | "category";
type SortDirection = "asc" | "desc";

/**
 * ProductTable Component
 *
 * A table component for displaying and managing products in the admin panel.
 * Provides sortable columns, edit and delete actions with confirmation dialog.
 *
 * Features:
 * - Sortable columns (name, price, stock, category)
 * - Edit action button for each product
 * - Delete action button with confirmation dialog
 * - Responsive table layout
 * - Loading state support
 * - Empty state message
 * - Accessible with proper ARIA attributes
 *
 * Requirements: 6.1, 6.6
 *
 * @example
 * ```tsx
 * <ProductTable
 *   products={products}
 *   onEdit={(product) => setEditingProduct(product)}
 *   onDelete={(id) => handleDelete(id)}
 *   loading={isDeleting}
 * />
 * ```
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] =
    useState<ProductWithImages | null>(null);

  // Handle sort column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "stock":
        aValue = a.stock;
        bValue = b.stock;
        break;
      case "category":
        aValue = a.category?.name.toLowerCase() || "";
        bValue = b.category?.name.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle delete button click
  const handleDeleteClick = (product: ProductWithImages) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Sort indicator icon
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  // Empty state
  if (products.length === 0) {
    return (
      <div
        className="text-center py-12 bg-gray-50 rounded-lg"
        data-testid="product-table-empty"
      >
        <p className="text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto" data-testid="product-table">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Name Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
                data-testid="sort-name"
              >
                <div className="flex items-center gap-2">
                  <span>Name</span>
                  <SortIcon field="name" />
                </div>
              </th>

              {/* Price Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("price")}
                data-testid="sort-price"
              >
                <div className="flex items-center gap-2">
                  <span>Price</span>
                  <SortIcon field="price" />
                </div>
              </th>

              {/* Stock Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("stock")}
                data-testid="sort-stock"
              >
                <div className="flex items-center gap-2">
                  <span>Stock</span>
                  <SortIcon field="stock" />
                </div>
              </th>

              {/* Category Column */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("category")}
                data-testid="sort-category"
              >
                <div className="flex items-center gap-2">
                  <span>Category</span>
                  <SortIcon field="category" />
                </div>
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
            {sortedProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50"
                data-testid={`product-row-${product.id}`}
              >
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </div>
                </td>

                {/* Stock */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.stock}</div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.category?.name || "N/A"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(product)}
                      disabled={loading}
                      data-testid={`edit-product-${product.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(product)}
                      disabled={loading}
                      data-testid={`delete-product-${product.id}`}
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
          <span className="font-semibold">{productToDelete?.name}</span>? This
          action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default ProductTable;
