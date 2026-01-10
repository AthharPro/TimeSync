import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import LandingPage from '../pages/LandingPage';

const RootRedirect: React.FC = () => {
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If user is authenticated, redirect to appropriate dashboard
    if (user && accessToken) {
      // Check if password needs to be changed on first login
      if (!user.isChangedPwd) {
        navigate('/resetpasswordfirstlogin', { replace: true });
        return;
      }

      // Redirect based on user role
      switch (user.role) {
        case UserRole.SuperAdmin:
          navigate('/super-admin', { replace: true });
          break;
        case UserRole.Admin:
          navigate('/admin', { replace: true });
          break;
        case UserRole.Emp:
          navigate('/employee', { replace: true });
          break;
        case UserRole.Supervisor:
          navigate('/employee', { replace: true });
          break;
        case UserRole.SupervisorAdmin:
          navigate('/admin', { replace: true });
          break;
        default:
          // If role is unknown, stay on landing page
          break;
      }
    }
  }, [user, accessToken, loading, navigate]);

  // Show landing page if not authenticated or while loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, show landing page
  if (!user || !accessToken) {
    return <LandingPage />;
  }

  // While redirecting, show a brief loading state
  return <div>Loading...</div>;
};

export default RootRedirect;
