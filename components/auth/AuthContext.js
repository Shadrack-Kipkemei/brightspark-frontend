"use client";

import { createContext, useContext, useEffect, useState, } from "react";
import { getToken, getUser, logout as clearAuth, saveAuth, } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();

    setToken(savedToken);
    setUser(savedUser);
    setLoading(false);
  }, []);

  const login = (accessToken, userData) => {
    saveAuth(accessToken, userData);

    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}