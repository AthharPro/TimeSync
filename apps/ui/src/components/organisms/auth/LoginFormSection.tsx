import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import LoginSchema from '../../../validations/auth/LoginSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { ILoginData } from '../../../interfaces/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useEffect } from 'react';
  
const LoginFormSection: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, accessToken } = useAuth()!;
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ILoginData>({
    resolver: yupResolver(LoginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // If user is already logged in, redirect to appropriate page
  useEffect(() => {
    if (user && accessToken) {
      console.log('👤 User already logged in, redirecting...');
      
      if (!user.isChangedPwd) {
        navigate('/resetpasswordfirstlogin', { replace: true });
        return;
      }

      switch(user.role) {
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
      }
    }
  }, [user, accessToken, navigate]);

  const onSubmit = async (data: ILoginData) => {
    console.log('🔐 Login attempt:', { email: data.email });
    
    const res = await login(data.email, data.password);
    
    console.log('🔐 Login response:', { success: res.success, hasUser: !!res.user });
    
    if (res.success && res.user) {
      showSuccess('Login successful! Redirecting...');
      
      // Store user reference for type safety
      const loggedInUser = res.user;
      
      // Check if user needs to change password on first login
      if (!loggedInUser.isChangedPwd) {
        console.log('🔑 First login detected, redirecting to password reset');
        navigate('/resetpasswordfirstlogin', { replace: true });
        return;
      }

      // Redirect based on user role immediately
      console.log('Navigating to dashboard for role:', loggedInUser.role);
      
      switch(loggedInUser.role) {
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
          console.error('❌ Unknown role, redirecting to login');
          navigate('/login', { replace: true });
      }
    } else {
      // Handle error from login response - always show user-friendly message
      console.error('Login failed:', res.error);
      showError('Login failed due to invalid credentials. Please try again.');
    }
  };

  return (
    <AuthFormLayout title="Login">
      <Grid sx={{ padding: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* form fields */}
          <BaseTextField
            label="Email"
            placeholder="Enter your email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
          />

          <BaseTextField
            label="Password"
            placeholder="Enter your password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                inputProps: { maxLength: 12 },
              },
            }}
          />
        {/* buttons */}
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={isSubmitting}
            fullWidth={true}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </BaseBtn>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              my: 2,
            }}
          >
            <Divider sx={{ flexGrow: 1 }} />
            <Typography sx={{ mx: 2 }}>OR</Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              component="button"
              onClick={() => navigate('/forgotpassword')}
              underline="hover"
              sx={{
                float: 'right',
                mt: 1,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
            >
              Forgot Password?
            </Link>
          </Grid>
        </form>
      </Grid>
      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </AuthFormLayout>
  );
};
export default LoginFormSection;
