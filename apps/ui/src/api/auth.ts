import API  from "../config/apiClient";
import { ILoginData, IChangePwdFirstLogin } from "../interfaces/auth";
import { UserRole } from "@tms/shared";

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
      throw error; 
    }
  }

export const sendPasswordResetEmail = async (email: string) => {
  try {
    return await API.post("/auth/password/forgot", { email });
  } catch (error) {
    throw error;
  }
};

export const verifyPasswordResetLink = async (token: string, verificationCode: string) => {
  try {
    return await API.get(`/auth/password/reset?token=${token}&verificationCode=${verificationCode}`);
  } catch (error) {
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
    throw error;
  }
};

export const registerUser = async (
  data: {
    email: string;
    firstName: string;
    lastName: string;
    designation: string;
    contactNumber: string;
  },
  role: UserRole
) => {
  try {
    const endpoint = role === UserRole.Admin ? '/api/user/admin' : '/api/user/employee';
    return await API.post(endpoint, data);
  } catch (error) {
    throw error;
  }
};

export const bulkRegisterUsers = async (
  users: any[],
  role: UserRole
) => {
  return await API.post('/api/user/bulk', { users, role });
};

