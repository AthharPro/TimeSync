import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface StatusDotProps {
  color: string;
  size?: number;
  sx?: SxProps<Theme>;
}

const StatusDot: React.FC<StatusDotProps> = ({ color, size = 8, sx = {} }) => {
  return (
    <Box
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        flexGrow: 0,
        display: 'inline-block',
        boxSizing: 'border-box',
        ...sx,
      }}
    />
  );
};

export default StatusDot;
