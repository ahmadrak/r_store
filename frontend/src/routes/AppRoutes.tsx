import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

// Public pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProductDetail from "../pages/ProductDetail";
import NotFound from "../pages/NotFound";

// Protected pages
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";

// Admin pages
import AdminProducts from "../pages/admin/Products";
import AdminCategories from "../pages/admin/Categories";
import AdminOrders from "../pages/admin/Orders";

/**
 * AppRoutes Component
 *
 * Defines all application routes with proper protection levels.
 * Routes are organized into three categories:
 * - Public routes: Accessible to all users
 * - Protected routes: Require authentication
 * - Admin routes: Require admin role
 *
 * Route Structure:
 * - / - Home page with product catalog
 * - /products/:id - Product detail page
 * - /login - Login page
 * - /signup - Signup page
 * - /cart - Shopping cart (protected)
 * - /checkout - Checkout page (protected)
 * - /orders - Order history (protected)
 * - /orders/:id - Order detail (protected)
 * - /admin/products - Product management (admin)
 * - /admin/categories - Category management (admin)
 * - /admin/orders - Order management (admin)
 * - * - 404 Not Found page
 *
 * @example
 * ```tsx
 * // In App.tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <CartProvider>
 *         <NotificationProvider>
 *           <AppRoutes />
 *         </NotificationProvider>
 *       </CartProvider>
 *     </AuthProvider>
 *   );
 * }
 * ```
 *
 * @returns Application routes wrapped in BrowserRouter
 */
export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - accessible to all users */}
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin routes - require admin role */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>

        {/* 404 Not Found - catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
