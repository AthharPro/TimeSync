import React from 'react';
import { Box, Typography, MenuItem } from '@mui/material';
import Divider from '@mui/material/Divider';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import NumberField from '../../atoms/other/inputField/NumberField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { IEditAccountFormProps } from '../../../interfaces/component/IEditAccountForm';

const EditAccountForm: React.FC<IEditAccountFormProps> = ({
  register,
  errors,
  isValid,
  isLoading,
  error,
  handleCancel,
  handleSubmit,
  onSubmit,
  accountData,
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 5,
          gap: 5,
        }}
      >
        {/* Editable fields only */}
        <BaseTextField
          variant="outlined"
          label="First Name"
          placeholder="First Name"
          {...register('firstName')}
          error={!!errors.firstName}
          helperText={errors.firstName?.message || ' '}
          fullWidth
          disabled={isLoading}
        />

        <BaseTextField
          variant="outlined"
          label="Last Name"
          placeholder="Last Name"
          {...register('lastName')}
          error={!!errors.lastName}
          helperText={errors.lastName?.message || ' '}
          fullWidth
          disabled={isLoading}
        />


        <BaseTextField
          variant="outlined"
          label="Designation"
          placeholder="Designation"
          {...register('designation')}
          error={!!errors.designation}
          helperText={errors.designation?.message || ' '}
          fullWidth
          disabled={isLoading}
        />

        <NumberField
          variant="outlined"
          label="Contact Number"
          placeholder="Contact Number"
          maxDigits={10}
          name="contactNumber"
          onChange={(e) => {
            register('contactNumber').onChange(e);
          }}
          onBlur={register('contactNumber').onBlur}
          inputRef={register('contactNumber').ref}
          error={!!errors.contactNumber}
          helperText={errors.contactNumber?.message || ' '}
          fullWidth
          disabled={isLoading}
        />

        <BaseTextField
          variant="outlined"
          label="Status"
          select
          {...register('status')}
          error={!!errors.status}
          helperText={errors.status?.message || ' '}
          fullWidth
          disabled={isLoading}
          defaultValue={accountData.status}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </BaseTextField>

        {error && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'error.light',
              color: 'error.contrastText',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <Box>
          <Divider />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <BaseBtn
            type="button"
            onClick={handleCancel}
            variant="outlined"
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            Cancel
          </BaseBtn>
          <BaseBtn
            sx={{ mt: 2 }}
            type="submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </BaseBtn>
        </Box>
      </Box>
    </form>
  );
};

export default EditAccountForm;
