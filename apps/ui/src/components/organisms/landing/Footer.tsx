import React from 'react';
import Box from '@mui/material/Box';
import SectionContainer from '../../atoms/landing/SectionContainer';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';


const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: 4,
        bgcolor: theme.palette.background.default,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <SectionContainer>
        <Box
          sx={{
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          
          <Typography variant="body2" sx={{color:theme.palette.text.secondary,textAlign:'center'}} >
            © 2025 TimeSync. All rights reserved.
          </Typography>
        </Box>
      </SectionContainer>
    </Box>
  );
};

export default Footer;
