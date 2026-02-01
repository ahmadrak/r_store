import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/common";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <div className="text-6xl mb-4">🔍</div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Go Back
          </Button>
          <Link to="/">
            <Button variant="primary">Go to Home</Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Browse Products
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/cart"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Cart
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
