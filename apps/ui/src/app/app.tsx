import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AppRoute from '../routes/AppRoute';
import { WindowNavigationProvider } from '../contexts/WindowNaviagationContext';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <WindowNavigationProvider>
        <AppRoute />
      </WindowNavigationProvider>
    </ThemeProvider>
  );
}
