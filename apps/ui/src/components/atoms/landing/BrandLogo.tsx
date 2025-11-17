import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { BrandLogoProps } from '../../../interfaces/landing';

const BrandLogo: React.FC<BrandLogoProps> = ({ src, alt = 'Logo', title }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <img src={src} alt={alt} style={{ height: 40 }} />
      {title ? (
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          {title}
        </Typography>
      ) : null}
    </Box>
  );
};

export default BrandLogo;


