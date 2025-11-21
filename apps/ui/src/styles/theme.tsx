import { createTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
const fonts = {
  primary: 'Roboto, Arial, sans-serif',
};
const theme = createTheme({
  palette: {
    primary: {
      main: '#013282',
    },
    secondary: {
      main: grey[300],
    },
    background: {
      default: '#ffffff',
      paper: '#EBEFF4',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#9A9A9A',
    },
    error: { main: '#ec1d35ff' },
    success: { main: '#10d110ff' },
  },
  typography: {
    fontFamily: fonts.primary,
    h1: { fontFamily: fonts.primary },
    h2: { fontFamily: fonts.primary },
    h3: { fontFamily: fonts.primary },
    h4: { fontFamily: fonts.primary },
    button: { fontFamily: fonts.primary },
  },
  components: {},
});

export default theme;
