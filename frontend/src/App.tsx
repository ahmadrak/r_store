import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

/**
 * Create QueryClient instance for TanStack Query
 * Configures default options for all queries and mutations
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Main App component that sets up the application context providers
 * and routes
 * @returns JSX.Element
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
