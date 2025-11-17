export interface IAuthResult {
  user: unknown;
  accessToken: string;
  refreshToken: string;
}

export interface ILoginParams {
  email: string;
  password: string;
  userAgent?: string;
}

export interface IRegisterParams {
  firstName: string;
  lastName: string;
  designation: string;
  contactNumber: string;
  email: string;
  password: string;
  role: string;
}

export interface IPasswordResetParams {
  email: string;
}

export interface IPasswordChangeParams {
  currentPassword: string;
  newPassword: string;
}

export interface ITokenPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenParams {
  refreshToken: string;
}

// Service interfaces
export interface LoginParams {
  email: string;
  password: string;
  userAgent?: string;
}
