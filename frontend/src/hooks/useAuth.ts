/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Re-exported from AuthContext for convenient importing.
 *
 * This hook provides access to:
 * - Current user state
 * - Authentication status
 * - Admin role detection
 * - Login, signup, and logout operations
 * - User data refresh
 *
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * import { useAuth } from '../hooks/useAuth';
 *
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.name}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export { useAuth } from "../contexts/AuthContext";
export type { AuthContextType } from "../contexts/AuthContext";
