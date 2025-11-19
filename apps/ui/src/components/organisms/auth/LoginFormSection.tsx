import { Grid, Link, Box, Typography, Divider } from '@mui/material';
import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import LoginSchema from '../../../validations/auth/LoginSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { ILoginData } from '../../../interfaces/auth';

const LoginFormSection: React.FC = () => {
  const navigate = useNavigate();

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
    </AuthFormLayout>
  );
};
export default LoginFormSection;
