import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import SignupForm from "../components/auth/SignupForm";
import { useAuth } from "../hooks/useAuth";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSignupSuccess = () => {
    navigate("/login");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <SignupForm onSuccess={handleSignupSuccess} />
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
