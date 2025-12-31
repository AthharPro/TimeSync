import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { BrowserRouter } from 'react-router-dom';
import store from './store/store';
import { Provider } from 'react-redux';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SnackbarProvider } from 'notistack';
import { useAuth } from './contexts/AuthContext';

// Wrapper component to access auth context
const AppWithNotifications = () => {
  const { user } = useAuth();
  return (
    <NotificationProvider userId={user?._id || null}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </NotificationProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={5000}
        >
          <AppWithNotifications />
        </SnackbarProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
