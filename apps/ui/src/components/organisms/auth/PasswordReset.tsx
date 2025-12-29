import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import { Box, CircularProgress } from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ISetPasswordData } from '../../../interfaces/auth/IAuth';
import FirstLoginPasswordRestSchema from '../../../validations/auth/FirstLoginPasswordRestSchema';
import { useAuth } from '../../../hooks/auth';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verificationCode = searchParams.get('verificationCode');

  const {
    verifyPasswordResetLink,
    resetPassword,
    loading,
    error,
    message,
    resetPasswordData,
    clearError,
    clearMessage,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ISetPasswordData>({
    resolver: yupResolver(FirstLoginPasswordRestSchema),
    mode: 'onChange',
  });

  // Verify the reset link on component mount
  useEffect(() => {
    if (token && verificationCode) {
      verifyPasswordResetLink(token, verificationCode).catch((err) => {
        console.error('Failed to verify reset link:', err);
      });
    } else {
      // If no token or verification code, redirect to forgot password page
      navigate('/forgotpassword');
    }

    return () => {
      clearError();
      clearMessage();
    };
  }, [token, verificationCode, verifyPasswordResetLink, navigate, clearError, clearMessage]);

  // Redirect to login page after successful password reset
  useEffect(() => {
    if (message && message.includes('successful')) {
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [message, navigate]);

  const onSubmit = async (data: ISetPasswordData) => {
    if (!resetPasswordData.verificationCodeId) {
      return;
    }

    try {
      await resetPassword(
        data.newPassword,
        resetPasswordData.verificationCodeId,
        data.confirmPassword
      );
    } catch (err) {
      console.error('Password reset error:', err);
    }
  };

  // Show loading spinner while verifying the link
  if (loading && !resetPasswordData.verificationCodeId) {
    return (
      <AuthFormLayout title="Verifying Reset Link" icon={WebSiteLogo}>
        <Box sx={{ padding: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </AuthFormLayout>
    );
  }

  // Show error if link verification failed
  if (error && !resetPasswordData.verificationCodeId) {
    return (
      <AuthFormLayout title="Invalid Reset Link" icon={WebSiteLogo}>
        <Box sx={{ padding: 3 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'error.light',
              color: 'error.contrastText',
              borderRadius: 1,
              textAlign: 'center',
              mb: 2,
            }}
          >
            {error}
          </Box>
          <BaseBtn fullWidth onClick={() => navigate('/forgotpassword')}>
            Request New Reset Link
          </BaseBtn>
        </Box>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Reset Password"
      description={`Reset password for ${resetPasswordData.email || ''}`}
      icon={WebSiteLogo}
    >
      <Box sx={{ padding: 3, maxWidth: 400 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BaseTextField
            label="New Password"
            type="password"
            sx={{ mb: 2 }}
            fullWidth
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message || ' '}
          />
          <BaseTextField
            label="Confirm Password"
            type="password"
            sx={{ mb: 2 }}
            fullWidth
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message || ' '}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting || loading}
            fullWidth
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </BaseBtn>

          {message && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              {message}
            </Box>
          )}

          {error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              {error}
            </Box>
          )}
        </form>
      </Box>
    </AuthFormLayout>
  );
};

export default PasswordReset;
