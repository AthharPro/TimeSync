import mongoose, { Document } from 'mongoose';

export interface ITimesheet extends Document {
  userId: mongoose.Types.ObjectId;
  status: string;
  date: Date;
  projectId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  billable: string;
  description: string;
  hours: string[];
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export type ITimesheetDocument = mongoose.Document & ITimesheet;

export type ITimesheetModel = mongoose.Model<ITimesheetDocument>;
