import React, { useState } from 'react';
import SectionContainer from '../../atoms/landing/SectionContainer';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useLocation } from 'react-router-dom';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BrandLogo from '../../atoms/landing/BrandLogo';
import BaseButton from '../../atoms/other/button/BaseBtn';
import HeaderDrawer from '../../molecules/landing/HeaderDrawer';
import NavItemSection from '../../molecules/landing/NavItemSection';
import HeaderLayout from '../../templates/landing/HeaderLayout';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Home', target: 'home' },
    { label: 'Features', target: 'features' },
    { label: 'Roles', target: 'roles' },
  ];

  const handleScrollTo = (targetId: string) => {
    const performScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(performScroll, 50);
    } else {
      performScroll();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <SectionContainer>
        <HeaderLayout
          logo={
            <BrandLogo src={WebSiteLogo} alt="TimeSync Logo" title="TimeSync" />
          }
          navItems={
            <NavItemSection
              items={navItems}
              onNavigate={handleScrollTo}
              display="flex"
              direction={isMobile ? 'column' : 'row'}
              alignItems={isMobile ? 'stretch' : 'center'}
            />
          }
          signInButton={
            <BaseButton
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                ...(isMobile && { width: '100%', mt: 2 }),
              }}
            >
              Sign In
            </BaseButton>
          }
          isMobile={isMobile}
          onMenuClick={() => setDrawerOpen(true)}
          drawer={
            <HeaderDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              navItems={navItems}
              handleScrollTo={handleScrollTo}
              navigate={navigate}
            />
          }
        />
      </SectionContainer>
    </Box>
  );
};

export default Header;
