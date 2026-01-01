import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import LoginSchema from '../../../validations/auth/LoginSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { replace, useNavigate } from 'react-router-dom';
import { ILoginData } from '../../../interfaces/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
  
const LoginFormSection: React.FC = () => {
  const navigate = useNavigate();
  const { login,user } = useAuth()!;
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ILoginData>({
    resolver: yupResolver(LoginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ILoginData) => {
    console.log(data);
    const res = await login(data.email, data.password);
    
    if (res.success && res.user) {
      showSuccess('Login successful! Redirecting...');
      
      // Store user reference for type safety in setTimeout callback
      const user = res.user;
      
      // Delay navigation to allow snackbar to show
      setTimeout(() => {
        // Check if user needs to change password on first login
        if (!user.isChangedPwd) {
          navigate('/resetpasswordfirstlogin', { replace: true });
          return;
        }

        // Redirect based on user role
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
          default:
            navigate('/login', { replace: true });
        }
      }, 1000); // 1 second delay to show snackbar
    } else {
      // Handle error from login response
      const errorMessage = res.error?.response?.data?.message || 
                          res.error?.message || 
                          'Invalid email or password. Please try again.';
      showError(errorMessage);
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
            disabled={!isValid}
            fullWidth={true}
          >
            Login
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
