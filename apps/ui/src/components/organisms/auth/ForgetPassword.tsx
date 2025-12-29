import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import { Box} from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PasswordResetFormSchema from '../../../validations/auth/PasswordResetSchema';
import { Link } from 'react-router-dom';
import { IPasswordResetData } from '../../../interfaces/auth/IAuth';
import { useAuth } from '../../../hooks/auth';
import { useEffect } from 'react';

const ForgetPassword: React.FC = () => {
    const { sendPasswordResetEmail, loading, error, message, clearError, clearMessage } = useAuth();
    
    const {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    } = useForm<IPasswordResetData>({
      resolver: yupResolver(PasswordResetFormSchema),
      mode: 'onChange',
    });

    // Clear error and message on unmount
    useEffect(() => {
      return () => {
        clearError();
        clearMessage();
      };
    }, [clearError, clearMessage]);

    const onSubmit = async (data: IPasswordResetData) => {
      try {
        await sendPasswordResetEmail(data.email);
      } catch (err) {
        // Error is handled by Redux
        console.error('Password reset error:', err);
      }
    };

  return (
    <AuthFormLayout
      title="Password Reset"
      description="Enter Email For Reset Password"
      icon={WebSiteLogo}
    >
      <Box sx={{ padding: 3 , maxWidth: 400}}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <BaseTextField
            label="Email"
            type="email"
            sx={{ mb: 2 }}
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message || ' '}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting || loading}
            fullWidth
            
          >
            {loading ? 'Sending...' : 'Confirm'}
          </BaseBtn>
          
          {message && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'success.light', 
              color: 'success.contrastText',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              {message}
            </Box>
          )}
          
          {error && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              {error}
            </Box>
          )}
        </form>
        <Box sx={{textAlign: 'center', display: 'block', mt: 2}}>
          <Link to="/login">Back to Login</Link>
        </Box>
      </Box>
    </AuthFormLayout>
  );
};

export default ForgetPassword;
