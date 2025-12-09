import React from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { IProfilePopoverProps } from '../../../interfaces/component/organism/IProfilePopover';
import { BaseBtn } from '../../atoms';

const ProfilePopover: React.FC<IProfilePopoverProps> = ({
  anchorEl,
  open,
  onClose,
  userName,
  userRole,
  onProfileClick,
  onLogoutClick,
}) => {
  const handleProfileClick = () => {
    onProfileClick();
    onClose();
  };

  const handleLogoutClick = () => {
    onLogoutClick();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 240,
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userRole}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Actions */}
      <Box sx={{ p: 1 }}>
        <BaseBtn
          fullWidth
          startIcon={<AccountCircleOutlinedIcon />}
          onClick={handleProfileClick}
          variant='text'
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            px: 2,
            py: 1,
            
          }}
        >
          Profile
        </BaseBtn>
        <BaseBtn
          fullWidth
          startIcon={<LogoutOutlinedIcon />}
          onClick={handleLogoutClick}
          variant='text'
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            px: 2,
            py: 1,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.lighter',
            },
          }}
        >
          Logout
        </BaseBtn>
      </Box>
    </Popover>
  );
};

export default ProfilePopover;