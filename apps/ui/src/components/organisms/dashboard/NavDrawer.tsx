import { Box, Divider, Drawer, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import DrawerList from '../../molecules/other/DrawerList';
import logo from '../../../assets/images/WebSiteLogo2.png';
import theme from '../../../styles/theme';
import INavItemProps from '../../../interfaces/navigation/INavItemProps';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? 215 : 60,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: open
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  '& .MuiDrawer-paper': {
    width: open ? 215 : 60,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: open
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    }),
    border: 'none',
    boxShadow: 'none',
  },
}));

interface NavDrawerProps {
  open: boolean;
  handleDrawer: (open: boolean) => void;
  items: INavItemProps[][];
}

export default function NavDrawer({
  open,
  handleDrawer,
  items,
}: NavDrawerProps) {
  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      onMouseEnter={() => handleDrawer(true)}
      onMouseLeave={() => handleDrawer(false)}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'primary.dark', 
          color: 'primary.contrastText', 
        },
      }}
    >
      <DrawerHeader>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            gap: 2,
            paddingTop: 1,
            paddingBottom: 1,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 47,
              height: 47,
            }}
          />
          {open && <Typography fontSize={25}>TimeSync</Typography>}
        </Box>
      </DrawerHeader>
      <Divider
        sx={{
          backgroundColor: theme.palette.text.secondary,
          marginX: 1,
          marginY: 0,
          padding: 0,
        }}
      />
      <DrawerList items={items}/>
    </StyledDrawer>
  );
}
