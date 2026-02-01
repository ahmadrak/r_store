import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <LoginForm onSuccess={handleLoginSuccess} />
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
