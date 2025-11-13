import {
  AppBar,
  Toolbar,
  Divider,
  Box,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useTheme} from '@mui/material';

export default function CustomAppBar() {
  const theme = useTheme();
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: theme.palette.background.default,
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
        <Box>
          <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={() => {}}
          >
            Hi,&nbsp;User
          </Button>
        </Box>
      </Toolbar>
      <Divider />
    </AppBar>
  );
}
