import apiClient from "./client";
import type { User } from "../types";

/**
 * Authentication API module
 *
 * Provides functions for user authentication operations:
 * - signup: Create a new user account
 * - login: Authenticate a user and establish a session
 * - logout: End the current user session
 * - getCurrentUser: Retrieve the currently authenticated user
 */

/**
 * Request payload for user signup
 */
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Request payload for user login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response from signup endpoint
 * Returns the created user directly
 */
export interface SignupResponse extends User {}

/**
 * Response from login endpoint
 * Returns a message and user data
 */
export interface LoginResponse {
  message: string;
  user: User;
}

/**
 * Response from getCurrentUser endpoint
 * Returns the authenticated user data
 */
export interface GetCurrentUserResponse {
  user: User;
}

/**
 * Sign up a new user
 *
 * Creates a new user account with the provided credentials.
 * On success, the user is NOT automatically logged in - they must
 * use the login endpoint separately.
 *
 * @param data - User registration data (name, email, password)
 * @returns Promise resolving to the created User object
 * @throws ApiError if registration fails (e.g., email already exists)
 *
 * @example
 * ```typescript
 * const user = await authApi.signup({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "securePassword123"
 * });
 * ```
 */
export async function signup(data: SignupRequest): Promise<User> {
  const response = await apiClient.post<SignupResponse>(
    "/api/auth/signup",
    data,
  );
  return response.data;
}

/**
 * Log in an existing user
 *
 * Authenticates a user with email and password credentials.
 * On success, establishes a session using HTTP-only cookies.
 *
 * @param data - Login credentials (email, password)
 * @returns Promise resolving to the authenticated User object
 * @throws ApiError if authentication fails (invalid credentials)
 *
 * @example
 * ```typescript
 * const user = await authApi.login({
 *   email: "john@example.com",
 *   password: "securePassword123"
 * });
 * ```
 */
export async function login(data: LoginRequest): Promise<User> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", data);
  return response.data.user;
}

/**
 * Log out the current user
 *
 * Ends the current user session by invalidating the session cookie.
 * After logout, the user must log in again to access protected resources.
 *
 * @returns Promise resolving when logout is complete
 * @throws ApiError if logout fails
 *
 * @example
 * ```typescript
 * await authApi.logout();
 * // User is now logged out
 * ```
 */
export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

/**
 * Get the currently authenticated user
 *
 * Retrieves the user data for the current session.
 * Used to restore authentication state on page load.
 *
 * NOTE: This endpoint needs to be added to the backend API.
 * Expected endpoint: GET /api/auth/me
 * Expected response: { user: User }
 *
 * @returns Promise resolving to the current User object
 * @throws ApiError if no user is authenticated (401)
 *
 * @example
 * ```typescript
 * try {
 *   const user = await authApi.getCurrentUser();
 *   console.log("Logged in as:", user.name);
 * } catch (error) {
 *   console.log("Not authenticated");
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<GetCurrentUserResponse>("/api/auth/me");
  return response.data.user;
}

/**
 * Authentication API object
 * Provides a convenient namespace for all auth operations
 */
export const authApi = {
  signup,
  login,
  logout,
  getCurrentUser,
};

export default authApi;
