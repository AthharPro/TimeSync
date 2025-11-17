import React from 'react';
import { Box, Typography } from '@mui/material';

interface WindowLayoutProps {
  title?: string;
  buttons?: React.ReactNode;
  children: React.ReactNode;
}

const WindowLayout: React.FC<WindowLayoutProps> = ({ title, buttons, children }) => {
  return (
      <Box
        sx={{
          height: '100%',
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: 1,
          overflow: 'auto',
        }}
      >
        {(title || buttons) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {title && (
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            )}
            {buttons && <Box sx={{ display: 'flex', gap: 1 }}>{buttons}</Box>}
          </Box>
        )}
        <Box sx={{ padding: 2 }}>
          {children}
        </Box>
      </Box>
  );
};

export default WindowLayout;


