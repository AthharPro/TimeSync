import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "@tms/shared";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { accessToken, user, loading } = useAuth();

  // Show loading while AuthContext is validating user
  if (loading) return <div>Loading...</div>;

  // Redirect to login if not authenticated
  if (!accessToken || !user) return <Navigate to="/login" replace />;

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
