import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutAPI } from '../api/auth';
import { IUser, AuthState, AuthContextType, AuthProviderProps } from '../interfaces';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useIsAuthenticated = () => {
  const { authState } = useAuth();
  return !!authState.user;
};


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false, 
  });

  const login = (user: IUser) => {
    try {
      console.log('AuthContext: Login called with user:', user);
      
      setAuthState({
        user,
        isLoading: false,
      });
      
      console.log('AuthContext: State updated, user authenticated:', true, 'role:', user.role);
      
    } catch (error) {
      console.error('AuthContext: Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
      
      setAuthState({
        user: null,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
      setAuthState({
        user: null,
        isLoading: false,
      });
    }
  };

  const updateUser = (updates: Partial<IUser>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  const checkAuth = async () => {
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const response = await getCurrentUser();
      const user = response.data.user;
      
      setAuthState({
        user,
        isLoading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
      });
      throw error; 
    }
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
