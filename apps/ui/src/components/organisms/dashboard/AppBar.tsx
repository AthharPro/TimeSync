import {AppBar,Toolbar,Divider,Box,Button,IconButton,Badge} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {useTheme} from '@mui/material';
import { useState } from 'react';
import NotificationPopover from '../popover/NotificationPopover';
import UserPopover from '../popover/UserPopover';
import ProfilePopup from '../popup/ProfilePopup';

export default function CustomAppBar() {
  const theme = useTheme();
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<HTMLElement | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleProfileClick = () => {
    setUserAnchorEl(null); // Close the user popover
    setIsProfileOpen(true); // Open the profile popup
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleLogoutClick = () => {
    // Add your logout logic here
    console.log('Logout clicked');
    // Example: window.location.href = '/login';
  };

  // Dummy unread notification count
  const unreadCount = 2;

  // Dummy user data
  const dummyUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    employee_id: 'EMP001',
    designation: 'Software Engineer',
    contactNumber: '+1 234 567 8900',
    role: 'EMPLOYEE' as any,
    status: true,
    isChangedPassword: true,
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
        border: 'none',
        height: '64px',
        alignContent: 'center',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px',
          marginLeft: '64px',
        }}
      >
        <Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleNotificationClick}
            sx={{
              color: theme.palette.text.primary,
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={handleUserClick}
          >
            Hi,&nbsp;{dummyUser.firstName || 'User'}
          </Button>
        </Box>
      </Toolbar>
      <Divider />
      <NotificationPopover
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
      />
      <UserPopover
        anchorEl={userAnchorEl}
        onClose={handleUserClose}
        onProfileClick={handleProfileClick}
        onLogoutClick={handleLogoutClick}
        user={dummyUser}
      />
      <ProfilePopup
        open={isProfileOpen}
        onClose={handleProfileClose}
        user={dummyUser}
      />
    </AppBar>
  );
}
