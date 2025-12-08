import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  taskName: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export interface ITaskDocument extends mongoose.Document, ITask {}

export interface ITaskModel extends mongoose.Model<ITaskDocument> {}
