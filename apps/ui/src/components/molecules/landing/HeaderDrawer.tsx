import React from 'react';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BaseButton from '../../atoms/other/button/BaseBtn';
import NavItemSection from './NavItemSection';
import { useTheme } from '@mui/material/styles';
import { HeaderDrawerProps } from '../../../interfaces/landing';

const HeaderDrawer: React.FC<HeaderDrawerProps> = ({
  open,
  onClose,
  navItems,
  handleScrollTo,
  navigate,
}) => {
  const theme = useTheme();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Typography
        variant="h5"
        sx={{
          p: 2,
          color: theme.palette.primary.main,
          textAlign: 'center',
        }}
      >
        TimeSync
      </Typography>
      <Box sx={{ width: 250, p: 2 }}>
        <NavItemSection
          items={navItems}
          onNavigate={(id) => {
            onClose();
            handleScrollTo(id);
          }}
          display="flex"
          direction="column"
          alignItems="stretch"
        />
        <BaseButton
          variant="contained"
          onClick={() => {
            onClose();
            navigate('/login');
          }}
          sx={{
            mt: 2,
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: theme.palette.primary.dark },
            width: '100%',
          }}
        >
          Sign In
        </BaseButton>
      </Box>
    </Drawer>
  );
};

export default HeaderDrawer;