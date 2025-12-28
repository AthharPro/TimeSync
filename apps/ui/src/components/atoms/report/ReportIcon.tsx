import React from 'react';
import { SvgIconProps } from '@mui/material';

interface ReportIconAtomProps extends SvgIconProps {
  variant?: 'default' | 'large';
}

const ReportIcon: React.FC<ReportIconAtomProps> = ({ 
  variant = 'default', 
  sx,
  ...props 
}) => {
  const iconSize = variant === 'large' ? 64 : 24;
  
  return (
    <ReportIcon
      sx={{
        fontSize: iconSize,
        color: 'text.secondary',
        ...sx
      }}
      {...props}
    />
  );
};

export default ReportIcon;
