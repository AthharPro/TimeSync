import { createTheme } from '@mui/material';
const fonts = {
  primary: 'Roboto, Arial, sans-serif',
};
const theme = createTheme({
  palette: {
    primary: {
      main: '#17204F',
    },
    secondary: {
      main: '#374EBE',
    },
    background: {
      default: '#E8EAF6',
      paper: '#F5F6FC',
    },
    text: {
      primary: '#090D1F',
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
