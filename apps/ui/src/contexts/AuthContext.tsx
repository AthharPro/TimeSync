import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import api from "../config/apiClient"; // axios instance
import { setAccessToken as setApiAccessToken } from "../config/apiClient";
import { User } from "@tms/shared";
import { initializeSocket, disconnectSocket } from "../services/socketService";

interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; error?: any }>;
  logout: () => void;
  updateAccessToken: (token: string | null) => void;
  updateUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

// Hook to use AuthContext
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Sync React state + Axios token
  const updateAccessToken = (token: string | null) => {
    setAccessToken(token);
    setApiAccessToken(token); // update axios client variable
  };

  const updateUser = (user: User | null) => {
    setUser(user);
  };

  // 🔄 Load user & token (if saved)
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Validate user and get access token from refresh token
          try {
            const res = await api.get("/auth/me");
            const validatedUser = res.data.user;
            const token = res.data.accessToken;


            // Update with validated user and token
            setUser(validatedUser);
            updateAccessToken(token);
            localStorage.setItem("user", JSON.stringify(validatedUser));

            // Initialize socket connection after successful validation
            const userId = validatedUser._id || validatedUser.id;
            if (userId) {
              initializeSocket(userId);
            }
          } catch (error) {
            // Clear invalid user data
            setUser(null);
            updateAccessToken(null);
            localStorage.removeItem("user");
            disconnectSocket();
          }
        } catch (error) {
          localStorage.removeItem("user");
          disconnectSocket();
        }
      } else {
      }

      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", { email, password });

      const { accessToken: token, user } = res.data;

      // Save to state + axios
      updateAccessToken(token);
      setUser(user);

      // Persist only user (token stays in memory)
      localStorage.setItem("user", JSON.stringify(user));

      // Initialize Socket.io connection for real-time notifications
      const userId = user._id || user.id;
      if (userId) {
        initializeSocket(userId);
      }

      return { success: true, user };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session
      await api.get('/auth/logout');
    } catch (error) {
    }

    // Disconnect socket before logging out
    disconnectSocket();

    // Clear state
    setUser(null);
    updateAccessToken(null);

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("selectedWindow"); // Clear the saved window selection

    // Force reload to clear all state
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        updateAccessToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
