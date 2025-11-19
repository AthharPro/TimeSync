import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import { Box} from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PasswordResetFormSchema from '../../../validations/auth/PasswordResetSchema';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { IPasswordResetData } from '../../../interfaces/auth/IAuth';

const ForgetPassword: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    } = useForm<IPasswordResetData>({
      resolver: yupResolver(PasswordResetFormSchema),
      mode: 'onChange',
    });

    const onSubmit = async (data: IPasswordResetData) => {
      setIsLoading(true);
      setError('');
      setMessage('');
      
      try {
        
      
      } catch (err: any) {
        
       
      } finally {
        setIsLoading(false);
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
            disabled={!isValid || isSubmitting || isLoading}
            fullWidth
            
          >
            {isLoading ? 'Sending...' : 'Confirm'}
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
