import { TextFieldProps } from '@mui/material';

export interface INumberFieldProps extends Omit<TextFieldProps, 'type'> {
  type?: 'int' | 'float' | 'decimal';
  maxDigits?: number;
  min?: number;
  max?: number;
  step?: number;
}
