import { BillableType } from '@tms/shared';
import mongoose, { Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  billable: BillableType;
  employees: mongoose.Types.ObjectId[];
  status: boolean;
  supervisor?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends mongoose.Document, IProject {}

export interface ICreateProjectParams {
  projectName: string;
  clientName: string;
  billable: BillableType;
  employees?: mongoose.Types.ObjectId[];
  status?: boolean;
  supervisor?: mongoose.Types.ObjectId;
}

export interface IUpdateProjectParams extends Partial<ICreateProjectParams> {
  _id?: string;
}

export interface CreateProjectParams {
  projectName: string;
  clientName: string;
  billable: BillableType;
  employees?: string[];
  supervisor?: string | null;
  status?: boolean;
}