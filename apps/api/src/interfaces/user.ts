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

export type IUserDocument = mongoose.Document & IUser;

export type IUserModel = mongoose.Model<IUserDocument>;

export interface CreateUserParams {
  email: string;
  designation: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  role: UserRole;
}