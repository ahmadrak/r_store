import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User } from "../types";
import { authApi } from "../api/auth";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      try {
        const userData = await authApi.getCurrentUser();
        if (active) setUser(userData);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadUser();
    return () => { active = false; };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const userData = await authApi.login({ email, password });
        setUser(userData);
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        await authApi.signup({ name, email, password });
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      setUser(null);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // If refresh fails, user might be logged out - clear state before throwing
      setUser(null);
      throw error;
    }
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === "admin";

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
