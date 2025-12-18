import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import ForgetPasswordPage from '../pages/ForgetPasswordPage';
import FirstLoginPasswordResetPage from '../pages/FirstLoginPasswordResetPage';
import PasswordChangePage from '../pages/PasswordChangePage';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '@tms/shared';
import EmployeePage from '../pages/EmployeePage';

const AppRoute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgotpassword" element={<ForgetPasswordPage />} />
      <Route
        path="/resetpasswordfirstlogin"
        element={<FirstLoginPasswordResetPage />}
      />
      <Route path="/change-password" element={<PasswordChangePage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.SupervisorAdmin]}>
        <AdminPage />
      </ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={[UserRole.SupervisorAdmin]}>
        <AdminPage />
      </ProtectedRoute>} />
            <Route path="/employee" element={<ProtectedRoute allowedRoles={[UserRole.Emp,UserRole.Supervisor]}>
        <EmployeePage/>
      </ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoute;
