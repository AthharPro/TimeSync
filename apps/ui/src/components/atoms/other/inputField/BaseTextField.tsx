import { TextField } from '@mui/material';
import React from 'react';
import { IBaseTextFieldProps } from '../../../../interfaces';

const BaseTextField = React.forwardRef<HTMLDivElement, IBaseTextFieldProps>(({
  variant = 'outlined',
  maxLength = 255,
  ...rest
}, ref) => {
  return (
    <TextField
      ref={ref} 
      variant={variant}
      fullWidth
      size="small"
      slotProps={{
        input: {
          inputProps: { maxLength }, 
        },
      }}
      {...rest}
    />
  );
});


export default BaseTextField;