import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../config/apiClient"; // your axios instance
import { User, UserRole } from "@tms/shared";


interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
  updateAccessToken: (token: string) => void;
  updateUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

// Hook to use auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAccessToken = (token: string) => {
    setAccessToken(token);
  };

  const updateUser = (user: User | null) => {
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user } = res.data;

      setUser(user);
      updateAccessToken(accessToken);

      localStorage.setItem("user", JSON.stringify(user));

      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        updateAccessToken,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
