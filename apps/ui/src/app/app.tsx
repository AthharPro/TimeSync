import './app.css';
import theme from '../styles/theme';
import { ThemeProvider } from '@emotion/react';
import AppRoute from '../Routes/AppRoute';
import { LoadingProvider } from '../contexts/LoadingContext';
import { AuthProvider } from '../contexts/AuthContext';
import GlobalLoading from '../components/organisms/common/loading/GlobalLoading';
import { ToastProvider } from '../contexts/ToastContext';
import { SocketProvider } from '../contexts/SocketContext';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <LoadingProvider>
          <ToastProvider>
            <SocketProvider>
              <GlobalLoading />
              <AppRoute />
            </SocketProvider>
          </ToastProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
