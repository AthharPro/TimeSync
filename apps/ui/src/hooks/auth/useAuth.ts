import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import {
  sendPasswordResetEmailThunk,
  verifyPasswordResetLinkThunk,
  resetPasswordThunk,
  clearAuthError,
  clearAuthMessage,
  clearResetPasswordData,
} from '../../store/slices/authSlice';

export interface IUseAuthReturn {
  // State
  loading: boolean;
  error: string | null;
  message: string | null;
  resetPasswordData: {
    verificationCodeId: string | null;
    userId: string | null;
    email: string | null;
  };

  // Actions
  sendPasswordResetEmail: (email: string) => Promise<void>;
  verifyPasswordResetLink: (token: string, verificationCode: string) => Promise<void>;
  resetPassword: (
    newPassword: string,
    verificationCodeId: string,
    confirmNewPassword: string
  ) => Promise<void>;
  clearError: () => void;
  clearMessage: () => void;
  clearResetData: () => void;
}

export const useAuth = (): IUseAuthReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux store
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);
  const message = useSelector((state: RootState) => state.auth.message);
  const resetPasswordData = useSelector((state: RootState) => state.auth.resetPasswordData);

  // Send password reset email
  const sendPasswordResetEmail = useCallback(
    async (email: string) => {
      await dispatch(sendPasswordResetEmailThunk(email)).unwrap();
    },
    [dispatch]
  );

  // Verify password reset link
  const verifyPasswordResetLink = useCallback(
    async (token: string, verificationCode: string) => {
      await dispatch(verifyPasswordResetLinkThunk({ token, verificationCode })).unwrap();
    },
    [dispatch]
  );

  // Reset password
  const resetPassword = useCallback(
    async (newPassword: string, verificationCodeId: string, confirmNewPassword: string) => {
      await dispatch(
        resetPasswordThunk({
          newPassword,
          verificationCodeId,
          confirmNewPassword,
        })
      ).unwrap();
    },
    [dispatch]
  );

  // Clear error
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Clear message
  const clearMessage = useCallback(() => {
    dispatch(clearAuthMessage());
  }, [dispatch]);

  // Clear reset password data
  const clearResetData = useCallback(() => {
    dispatch(clearResetPasswordData());
  }, [dispatch]);

  return {
    loading,
    error,
    message,
    resetPasswordData,
    sendPasswordResetEmail,
    verifyPasswordResetLink,
    resetPassword,
    clearError,
    clearMessage,
    clearResetData,
  };
};
