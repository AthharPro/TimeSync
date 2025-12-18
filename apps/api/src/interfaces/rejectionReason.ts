import mongoose, { Document } from 'mongoose';

export interface ITimesheetRejection extends Document {
  timesheetId: mongoose.Types.ObjectId;
  rejectedBy: mongoose.Types.ObjectId;
  rejectionReason: string;
  rejectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ITimesheetRejectionDocument = mongoose.Document & ITimesheetRejection;

export type ITimesheetRejectionModel = mongoose.Model<ITimesheetRejectionDocument>;
