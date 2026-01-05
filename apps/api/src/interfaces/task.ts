import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  taskName: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export type ITaskDocument = mongoose.Document & ITask;

export type ITaskModel = mongoose.Model<ITaskDocument>;
