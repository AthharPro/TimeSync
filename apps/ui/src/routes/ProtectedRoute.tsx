import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "@tms/shared";
import axios from "axios";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { accessToken, user, updateUser, updateAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);

  const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  
});

  useEffect(() => {
    const loadUserIfNeeded = async () => {

      if (accessToken && user) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        updateUser(res.data.user);
        if (res.data.accessToken) updateAccessToken(res.data.accessToken);
      } catch {
        updateUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserIfNeeded();
  }, [accessToken, user, updateUser, updateAccessToken]);

  if (loading) return <div>Loading...</div>;

  if (!accessToken || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
