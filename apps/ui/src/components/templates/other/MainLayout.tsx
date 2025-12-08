import { useState } from 'react';
import Box from '@mui/material/Box';
import CustomAppBar from '../../organisms/dashboard/AppBar';
import NavDrawer from '../../organisms/dashboard/NavDrawer';
import { useTheme } from '@mui/material/styles';
import { IMainLayoutProps } from '../../../interfaces/layout';

export default function MainLayout({ children, items }: IMainLayoutProps) {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CustomAppBar />
      <NavDrawer open={open} handleDrawer={handleDrawerOpen} items={items} />
      <Box
        sx={{
          flexGrow: 1,
          marginTop: '60px',
          backgroundColor: theme.palette.background.default,
          overflow: 'auto',
        }}
      >
        <Box sx={{ height: 'calc(100vh - 108px)', padding: 3 }}>
          <Box sx={{ height: '100%' }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
