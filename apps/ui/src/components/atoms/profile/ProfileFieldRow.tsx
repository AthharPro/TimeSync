import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProfileFieldRowProps } from '../../../interfaces/profile';
import { useTheme } from '@mui/material/styles';
const ProfileFieldRow: React.FC<ProfileFieldRowProps> = ({
  label,
  value,
  icon,
}) => {
  const theme = useTheme();
  
  return (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      p: 2,
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'grey.400',
    }}
  >
    {icon && <Box sx={{ color:theme.palette.primary.main, mt: 0.5 }}>{icon}</Box>}
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="body1"
        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ mt: 0.5, wordBreak: 'break-word', whiteSpace: 'pre-line',color: theme.palette.text.secondary }}
      >
        {value || '-'}
      </Typography>
    </Box>
  </Box>
  );
};

export default ProfileFieldRow;
