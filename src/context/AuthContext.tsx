"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, User, SignInData, SignUpData } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    const response = await authService.signIn(data);
    setUser(response.data.user);
  };

  const signUp = async (data: SignUpData) => {
    const response = await authService.signUp(data);
    setUser(response.data.user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
