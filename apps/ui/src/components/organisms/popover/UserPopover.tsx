import React from 'react';
import {
  Popover,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { User } from '@tms/shared';

interface UserPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  user?: User | null;
}

export default function UserPopover({
  anchorEl,
  onClose,
  onProfileClick,
  onLogoutClick,
  user,
}: UserPopoverProps) {
  const fullName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || 'User';

  const email = user?.email || 'user@example.com';

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
      open={Boolean(anchorEl)}
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
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: 240,
          },
        },
      }}
    >
      <Box sx={{ width: '100%', py: 0.5 }}>
        {/* User Info Section */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fullName}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {email}
          </Typography>
        </Box>

        <Divider />

        {/* Menu Options */}
        <List sx={{ py: 0.5 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleProfileClick}
              sx={{
                px: 2,
                py: 0.75,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="My Profile" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 0.5 }} />

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                px: 2,
                py: 0.75,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: 'error' 
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Popover>
  );
}