import React from 'react';
import { Avatar, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ProfileAvatarProps } from '../../../interfaces/profile/atom';

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  firstName,
  lastName,
  size = 88,
}) => {
  const theme = useTheme();
  
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <Box sx={{ position: 'relative' }}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: `${size * 0.25}px`,
          fontWeight: 'bold',
          bgcolor: theme.palette.text.secondary,
          color: 'white',
        }}
      >
        {initials}
      </Avatar>
    </Box>
  );
};

export default ProfileAvatar;
