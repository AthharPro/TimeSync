import API  from "../config/apiClient";
import { ILoginData, IChangePwdFirstLogin } from "../interfaces/auth";

export const login = async (data: ILoginData) => {
  return await API.post("/auth/login", data);
};

export const getCurrentUser = async () => {
  try {
    return await API.get("/auth/me");
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status !== 401) {
        // Handle non-401 errors if needed
      }
    }
    throw error;
  }
};


export const changePwdFirstLogin = async (data:IChangePwdFirstLogin) => {
  return await API.post("/auth/change-password",data);
}
  


export const logout = async () => {
    try {
      return await API.get("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; 
    }
  }

export const sendPasswordResetEmail = async (email: string) => {
  try {
    return await API.post("/auth/password/forgot", { email });
  } catch (error) {
    console.error("Password reset email failed:", error);
    throw error;
  }
};

export const verifyPasswordResetToken = async (token: string) => {
  try {
    return await API.post('/auth/password/reset/verify-token', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};

export const resetPassword = async (data: {
  newPassword: string;
  verificationCodeId: string;
  confirmNewPassword: string;
}) => {
  try {
    return await API.post("/auth/password/reset", data);
  } catch (error) {
    console.error("Password reset failed:", error);
    throw error;
  }
};

