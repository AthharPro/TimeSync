import mongoose, { Document, mongo } from 'mongoose';

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

export interface ITimesheetDocument extends mongoose.Document, ITimesheet {}

export interface ITimesheetModel extends mongoose.Model<ITimesheetDocument> {}
