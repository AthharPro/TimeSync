import API  from "../config/apiClient";
import { IChangePwdFirstLogin, ILoginDetails } from "../interfaces/auth";

export const login = async (data: ILoginDetails) => {
    try {
      return await API.post("/auth/login", data);
    } catch (error) {
      throw error; 
    }
  };

export const getCurrentUser = async () => {
  try {
    return await API.get("/auth/me");
  } catch (error: any) {
    if (error?.response?.status !== 401) {
    }
    throw error;
  }
};


export const changePwdFirstLogin = async (data:IChangePwdFirstLogin) => {
  try {
    return await API.post("/auth/change-password",data);
  } catch (error) {
    throw error; 
  }
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

