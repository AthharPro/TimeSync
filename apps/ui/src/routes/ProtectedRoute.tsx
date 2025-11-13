import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../interfaces/navigation/IProtectedRouteProps';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ 
  isAllowed, 
  children, 
  redirectPath = "/",
  requireAuth = false,
  allowedRoles = []
}) => {
  const { authState, checkAuth } = useAuth();
  const { user } = authState;
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    const performAuthCheck = async () => {
      if (requireAuth && !hasCheckedAuth && !isCheckingAuth) {
        setIsCheckingAuth(true);
        try {
          await checkAuth();
        } catch {
          // Auth check failed, user will be redirected to login
        } finally {
          setHasCheckedAuth(true);
          setIsCheckingAuth(false);
        }
      } else if (!requireAuth && !hasCheckedAuth) {
        setHasCheckedAuth(true);
      }
    };

    performAuthCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireAuth, hasCheckedAuth, isCheckingAuth]);


  if (requireAuth) {


    if (!isAuthenticated) {
 
      return <Navigate to={redirectPath} replace />;
    }

   
    if (allowedRoles.length > 0 && user) {
      const hasPermission = allowedRoles.includes(user.role);
      if (!hasPermission) {
        return <Navigate to="/" replace />;
      }
    }
  }

  if (isAllowed !== undefined) {
 
    
    if (!isAllowed) {

      return <Navigate to={redirectPath} replace />;
    }
  }
  return children;
};

export default ProtectedRoute;