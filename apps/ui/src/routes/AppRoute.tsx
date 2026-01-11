import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminPage from '../pages/AdminPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import ForgetPasswordPage from '../pages/ForgetPasswordPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import FirstLoginPasswordResetPage from '../pages/FirstLoginPasswordResetPage';
import PasswordChangePage from '../pages/PasswordChangePage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';
import RootRedirect from './RootRedirect';
import { UserRole } from '@tms/shared';
import EmployeePage from '../pages/EmployeePage';
import SuperAdminPage from '../pages/SuperAdminPage';

const AppRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Helper function to get the appropriate home path based on user role
  const getUserHomePath = () => {
    if (!user) return null;
    
    switch (user.role) {
      case UserRole.SuperAdmin:
        return '/super-admin';
      case UserRole.Admin:
      case UserRole.SupervisorAdmin:
        return '/admin';
      case UserRole.Emp:
      case UserRole.Supervisor:
        return '/employee';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          loading ? (
            <div>Loading...</div>
          ) : user ? (
            <Navigate to={getUserHomePath() || '/login'} replace />
          ) : (
            <LandingPage />
          )
        } 
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgotpassword" element={<ForgetPasswordPage />} />
      <Route path="/password/reset" element={<PasswordResetPage />} />
      <Route
        path="/resetpasswordfirstlogin"
        element={<FirstLoginPasswordResetPage />}
      />
      <Route path="/change-password" element={<PasswordChangePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]}>
        <AdminPage />
      </ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={[UserRole.SuperAdmin]}>
        <SuperAdminPage />
      </ProtectedRoute>} />
            <Route path="/employee" element={<ProtectedRoute allowedRoles={[UserRole.Emp,UserRole.Supervisor]}>
        <EmployeePage/>
      </ProtectedRoute>} />

    </Routes>
  );
};

export default AppRoute;
