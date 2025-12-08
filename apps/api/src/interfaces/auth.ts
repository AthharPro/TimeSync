import { SignOptions } from 'jsonwebtoken';

export interface IAccessTokenPayload {
  userId: string; 
  role: string; 
}

export interface IRefreshTokenPayload {
  userId: string; 
}

export interface ITokenOptions extends SignOptions {
  secret: string;
}

export interface ILoginParams {
  email: string;
  password: string;
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

export interface LoginParams {
  email: string;
  password: string;
  userAgent?: string;
}
