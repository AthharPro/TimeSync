import mongoose, { Schema } from "mongoose";
import { ITaskDocument } from '../interfaces';

const taskSchema = new Schema<ITaskDocument>({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  taskName: { type: String }
}, {
  timestamps: true
});

export const Task = mongoose.model<ITaskDocument>(
  "Task",
  taskSchema
);