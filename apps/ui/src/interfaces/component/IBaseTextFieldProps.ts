import { TextFieldProps } from '@mui/material';

export interface IBaseTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  maxLength?: number;
}
