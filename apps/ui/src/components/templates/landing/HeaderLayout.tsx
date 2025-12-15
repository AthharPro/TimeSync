import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { IHeaderLayoutProps } from '../../../interfaces/landing/ILanding';  

const HeaderLayout: React.FC<IHeaderLayoutProps> = ({
  logo,
  navItems,
  signInButton,
  isMobile,
  onMenuClick,
  drawer,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
    <Box sx={{ flex: 1 }}>{!isMobile && navItems}</Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flex: 1 }}>{logo}</Box>
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      {isMobile ? (
        <>
          <IconButton onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          {drawer}
        </>
      ) : (
        signInButton
      )}
    </Box>
  </Box>
);

export default HeaderLayout;