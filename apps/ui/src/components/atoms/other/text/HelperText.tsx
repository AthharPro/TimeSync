import { Typography, TypographyProps, SxProps, Theme } from '@mui/material';
import React from 'react';

export interface HelperTextProps extends Omit<TypographyProps, 'variant'> {
  children: React.ReactNode;
  variant?: TypographyProps['variant'];
  align?: 'left' | 'center' | 'right' | 'justify';
  sx?: SxProps<Theme>;
}

const HelperText: React.FC<HelperTextProps> = ({
  children,
  variant = 'body1',
  color = 'text.secondary',
  align = 'center',
  sx,
  ...props
}) => {
  return (
    <Typography
      variant={variant}
      color={color}
      align={align}
      sx={{ py: 4, ...sx }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default HelperText;

