import mongoose, { Document } from 'mongoose';
import { UserRole } from '@tms/shared';

export interface IUser extends Document {
  employee_id?: string;
  firstName: string;
  lastName: string;
  designation: string;
  contactNumber: string;
  teams: mongoose.Types.ObjectId[];
  email: string;
  password: string;
  role: string;
  isChangedPwd: boolean;
  status?: boolean;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    IUser,
    | 'employee_id'
    | 'firstName'
    | 'lastName'
    | 'designation'
    | 'contactNumber'
    | 'email'
    | 'role'
    | 'isChangedPwd'
    | 'isVerified'
    | 'createdAt'
    | 'updatedAt'
    | '__v'
  >;
}

export interface IUserDocument extends mongoose.Document, IUser {}

export interface IUserModel extends mongoose.Model<IUserDocument> {
  findAllByRole(role: UserRole): Promise<IUserDocument[]>;
  findAllByRoles(roles: UserRole[]): Promise<IUserDocument[]>;
  findAllActive(): Promise<IUserDocument[]>;
  findAllIncludingInactive(roles: UserRole[]): Promise<IUserDocument[]>;
}

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ISessionDocument extends mongoose.Document, ISession {}

export interface IVerificationCode extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IVerificationCodeDocument extends mongoose.Document, IVerificationCode {}

export interface CreateUserParams {
  email: string;
  designation: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  role: UserRole;
  userAgent?: string;
}

export interface ChangePasswordParams {
  userId: string;
  newPassword: string;
}
