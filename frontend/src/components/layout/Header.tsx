import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Site Title */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            onClick={closeMobileMenu}
          >
            E-Shop
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Main Navigation Links */}
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>

            {/* Cart Link with Badge */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Orders Link (authenticated users only) */}
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Orders
              </Link>
            )}

            {/* Admin Links (admin users only) */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/products"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Manage Products
                </Link>
                <Link
                  to="/admin/categories"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Manage Categories
                </Link>
                <Link
                  to="/admin/orders"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Manage Orders
                </Link>
              </>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              // Close icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              {/* Main Navigation Links */}
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>

              {/* Cart Link with Badge */}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 flex items-center"
                  onClick={closeMobileMenu}
                >
                  Cart
                  {itemCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Orders Link (authenticated users only) */}
              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={closeMobileMenu}
                >
                  Orders
                </Link>
              )}

              {/* Admin Links (admin users only) */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      Admin
                    </p>
                  </div>
                  <Link
                    to="/admin/products"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={closeMobileMenu}
                  >
                    Manage Products
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={closeMobileMenu}
                  >
                    Manage Categories
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={closeMobileMenu}
                  >
                    Manage Orders
                  </Link>
                </>
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-gray-700 py-2">
                      Welcome,{" "}
                      <span className="font-semibold">{user?.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3"></div>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium text-center"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
