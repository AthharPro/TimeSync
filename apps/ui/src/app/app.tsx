import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AppRoute from '../routes/AppRoute';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppRoute />
    </ThemeProvider>
  );
}
