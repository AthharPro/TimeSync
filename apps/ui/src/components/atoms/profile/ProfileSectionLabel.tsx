import React from 'react';
import { Typography } from '@mui/material';
import { ProfileSectionLabelProps } from '../../../interfaces/profile';
import { useTheme } from '@mui/material/styles';

const ProfileSectionLabel: React.FC<ProfileSectionLabelProps> = ({ label }) => {
  const theme = useTheme();
  
  return (
    <Typography
      variant="h6"
      sx={{ 
        mb: 2, 
        fontWeight: 600, 
        color: theme.palette.text.primary,
        fontSize: '1.125rem',
      }}
    >
      {label}
    </Typography>
  );
};

export default ProfileSectionLabel;
