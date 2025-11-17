import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { HeaderLayoutProps } from '../../../interfaces/landing/ILanding';  

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  logo,
  navItems,
  signInButton,
  isMobile,
  onMenuClick,
  drawer,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>{logo}</Box>
    {isMobile ? (
      <>
        <IconButton onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
        {drawer}
      </>
    ) : (
      <>
        {navItems}
        {signInButton}
      </>
    )}
  </Box>
);

export default HeaderLayout;