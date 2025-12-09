import React from 'react';
import { AppBar, Toolbar, Divider, Box, Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material';
import ProfilePopover from '../popover/ProfilePopover';

export default function CustomAppBar() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const hanldeClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleLogoutClick = () => {
    console.log('Logout clicked');
  };

  const open = Boolean(anchorEl);

  return (
    <>
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
          <Box></Box>
          <Box>
            <Button
              variant="text"
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                textTransform: 'none',
              }}
              onClick={hanldeClick}
            >
              Hi,&nbsp;User
            </Button>
          </Box>
        </Toolbar>
        <Divider />
      </AppBar>

      <ProfilePopover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        userName="John Doe"
        userRole="Administrator"
        onProfileClick={handleProfileClick}
        onLogoutClick={handleLogoutClick}
      />
    </>
  );
}
