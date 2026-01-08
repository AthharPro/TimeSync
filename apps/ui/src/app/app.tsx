import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AppRoute from '../routes/AppRoute';
import { WindowNavigationProvider } from '../contexts/WindowNaviagationContext';
import { SearchProvider } from '../contexts/SearchContext';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <SearchProvider>
        <WindowNavigationProvider>
          <AppRoute />
        </WindowNavigationProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
