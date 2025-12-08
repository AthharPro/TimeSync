import {
  TextFieldVariants,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material';
import { IBaseTextFieldProps } from '../IBaseTextFieldProps';

export interface AutocompleteTextProps<T> {
  value: T | null;
  onChange: (event: React.SyntheticEvent, newValue: T | null) => void;
  options: T[];
  variant?: TextFieldVariants;
  placeholder?: string;
}

export interface DatePickerFieldProps {
  value: Date;
  onChange: (newDate: Date | null) => void;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  width?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

export interface IDropdownProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: Record<string, T>; 
  labels?: Record<T, string>;
  onClick?: (e: React.MouseEvent) => void;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  sx?: SxProps<Theme>;
}

export interface IHoursFieldProps extends Omit<IBaseTextFieldProps, 'value' | 'onChange' | 'type'> {
  value?: number;
  onChange?: (hours: number) => void;
}
