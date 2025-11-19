import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import { Grid, Box } from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ChangePasswordSchema from '../../../validations/auth/ChangePasswordSchema';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ISetPasswordData } from '../../../interfaces/auth/IAuth';

const PasswordChange: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userInfo, setUserInfo] = useState<{ email: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [verificationCodeId, setVerificationCodeId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ISetPasswordData>({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const verificationCode = searchParams.get('verificationCode');

      if (!token || !verificationCode) {
        setVerificationError(
          'Invalid reset link. Please request a new password reset.'
        );
        setIsVerifying(false);
        return;
      }

      try {
        // Handle token verification logic here
        // On success, set user info and verificationCodeId
        
       
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const onSubmit = async (data: ISetPasswordData) => {
    if (!verificationCodeId) {
      setError(
        'Verification code not found. Please use the reset link from your email.'
      );
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Handle password change logic here
      console.log('Password change initiated');
    } catch (error) {
      console.error('Password change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isVerifying) {
    return (
      <AuthFormLayout title="Verifying Reset Link" icon={WebSiteLogo}>
        <Grid sx={{ padding: 3, textAlign: 'center' }}>
          <Box>Verifying your reset link...</Box>
        </Grid>
      </AuthFormLayout>
    );
  }

  if (verificationError) {
    return (
      <AuthFormLayout title="Reset Link Error" icon={WebSiteLogo}>
        <Grid sx={{ padding: 3, textAlign: 'center' }}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'error.light',
              color: 'error.contrastText',
              borderRadius: 1,
              mb: 2,
            }}
          >
            {verificationError}
          </Box>
          <BaseBtn onClick={() => navigate('/forgotpassword')} fullWidth>
            Request New Reset Link
          </BaseBtn>
        </Grid>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout title="Reset Password" icon={WebSiteLogo}>
      <Grid sx={{ paddingX: 3 }}>
        {userInfo && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: 'info.dark',
              color: 'info.contrastText',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            Reset password for: {userInfo.email}
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BaseTextField
            label="New Password"
            type="password"
            sx={{ mb: 2 }}
            fullWidth
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <BaseTextField
            label="Confirm Password"
            type="password"
            sx={{ mb: 2 }}
            fullWidth
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting || isLoading}
            fullWidth={true}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
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
      </Grid>
    </AuthFormLayout>
  );
};

export default PasswordChange;
