import AuthFormLayout from '../../templates/auth/AuthFormLayout';
import { Grid } from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FirstLoginPasswordRestSchema  from '../../../validations/auth/FirstLoginPasswordRestSchema';
import { useNavigate } from 'react-router-dom';
import { ISetPasswordData } from '../../../interfaces/auth/IAuth';

const FirstLoginPasswordReset: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ISetPasswordData>({
    resolver: yupResolver(FirstLoginPasswordRestSchema),
    mode: 'onChange',
  });
  
  const onSubmit = async (data: ISetPasswordData) => {
    
  };
  return (
    <AuthFormLayout title="Set Password" icon={WebSiteLogo}>
      <Grid sx={{ padding: 3, mt: -2 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Form fields for setting a new password */}
          <BaseTextField
            label="New Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <BaseTextField
            label="Confirm Password"
            type="password"
            sx={{ mb: 2 }}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <BaseBtn
            type="submit"
            sx={{ mb: 2 }}
            disabled={!isValid || isSubmitting}
            fullWidth={true}
          >
            Save
          </BaseBtn>
        </form>
      </Grid>
    </AuthFormLayout>
  );
};

export default FirstLoginPasswordReset;
