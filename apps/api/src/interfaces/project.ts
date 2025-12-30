import { BillableType } from '@tms/shared';
import mongoose, { Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  isPublic: boolean;
  costCenter: string;
  clientName: string;
  projectType: string;
  billable: BillableType;
  employees: { user: mongoose.Types.ObjectId; allocation?: number }[];
  status: boolean;
  supervisor?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends mongoose.Document, IProject {}

export interface ICreateProjectParams {

  projectName: string;
  startDate?: Date | null;
  endDate?: Date | null;
  description: string;
  clientName: string;
  costCenter: string;
  projectType: string;
  isPublic: boolean;
  billable: BillableType;
  employees?: { user: mongoose.Types.ObjectId; allocation?: number }[];
  status?: boolean;
  supervisor?: mongoose.Types.ObjectId;
}

export interface IUpdateProjectParams extends Partial<ICreateProjectParams> {
  _id?: string;
}

export interface CreateProjectParams {
  projectName: string;
  // Optional dates coming from normalized schema
  startDate?: Date | null;
  endDate?: Date | null;
  // Required description (validated by zod before reaching service)
  description: string;
  isPublic: boolean;
  clientName: string;
  costCenter: string;
  projectType: string;
  billable: BillableType;
  employees?: { user: string; allocation?: number }[];
  supervisor?: string | null;
  status?: boolean;
}