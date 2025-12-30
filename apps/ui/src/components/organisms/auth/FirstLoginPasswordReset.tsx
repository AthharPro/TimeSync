import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import { Grid, Box, CircularProgress, Alert } from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FirstLoginPasswordRestSchema  from '../../../validations/auth/FirstLoginPasswordRestSchema';
import { ISetPasswordData } from '../../../interfaces/auth/IAuth';
import { changePwdFirstLogin } from '../../../api/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '@tms/shared';

const FirstLoginPasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ISetPasswordData>({
    resolver: yupResolver(FirstLoginPasswordRestSchema),
    mode: 'onChange',
  });
  
  const onSubmit = async (data: ISetPasswordData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API to change password
      const response = await changePwdFirstLogin({ 
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword 
      });

      setSuccess(true);
      
      // Update user with isChangedPwd = true
      if (user) {
        const updatedUser = { ...user, isChangedPwd: true };
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Redirect to appropriate dashboard based on user role after a short delay
      setTimeout(() => {
        switch(user?.role) {
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
            navigate('/login', { replace: true });
        }
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthFormLayout title="Set Password" icon={WebSiteLogo}>
      <Grid sx={{ padding: 3, mt: -2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password changed successfully! Redirecting to dashboard...
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Form fields for setting a new password */}
          <BaseTextField
            label="New Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            disabled={loading || success}
          />
          <BaseTextField
            label="Confirm Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={loading || success}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting || loading || success}
            fullWidth={true}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </BaseBtn>
        </form>
      </Grid>
    </AuthFormLayout>
  );
};

export default FirstLoginPasswordReset;
