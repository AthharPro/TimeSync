import {AppBar,Toolbar,Divider,Box,Button,IconButton,Badge} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {useTheme} from '@mui/material';
import { useState, useEffect } from 'react';
import NotificationPopover from '../popover/NotificationPopover';
import UserPopover from '../popover/UserPopover';
import ProfilePopup from '../popup/ProfilePopup';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { useWindowNavigation } from '../../../hooks/useWindowNavigation';
import { useSearch } from '../../../contexts/SearchContext';
import SearchField from '../../atoms/common/SearchField';

export default function CustomAppBar() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationContext();
  const { selectedButton } = useWindowNavigation();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<HTMLElement | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Clear search when navigating away from searchable windows
  useEffect(() => {
    const searchableWindows = ['Accounts', 'Projects', 'Teams'];
    if (!searchableWindows.includes(selectedButton || '')) {
      clearSearch();
    }
  }, [selectedButton, clearSearch]);

  // Determine if search field should be shown
  const showSearch = selectedButton === 'Accounts' || selectedButton === 'Projects' || selectedButton === 'Teams';

  // Determine placeholder based on active window
  const getSearchPlaceholder = () => {
    switch (selectedButton) {
      case 'Accounts':
        return 'Search by name, designation, or email...';
      case 'Projects':
        return 'Search by project name...';
      case 'Teams':
        return 'Search by team name...';
      default:
        return 'Search...';
    }
  };

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
    logout();
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
        <Box sx={{ flex: 1 }}>
        </Box>
        
        {/* Centered Search Field */}
        {showSearch && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flex: 2,
            maxWidth: '500px'
          }}>
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={getSearchPlaceholder()}
              fullWidth
              sx={{ mt: 0 }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
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
            Hi,&nbsp;{user?.firstName || 'User'}
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
        user={user}
      />
      <ProfilePopup
        open={isProfileOpen}
        onClose={handleProfileClose}
        user={user}
      />
    </AppBar>
  );
}
