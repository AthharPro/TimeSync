import { DailyTimesheetStatus } from '@tms/shared';
import mongoose, { Schema } from "mongoose";
import { ITimesheetDocument } from '../interfaces';

const timesheetSchema = new Schema<ITimesheetDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: Object.values(DailyTimesheetStatus), default: DailyTimesheetStatus.Draft },
  date: { type: Date, required: true }, 
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project',default:null,required:false },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task',default:null,required:false },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team',default:null,required:false },
  billable:{type:String},
  description: { type: String },
  hours: { type: Number},
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate project+task on the same date for a user
// Only applies when both projectId and taskId are not null
timesheetSchema.index(
  { userId: 1, projectId: 1, taskId: 1, date: 1 },
  { 
    unique: true,
    partialFilterExpression: {
      projectId: { $ne: null },
      taskId: { $ne: null }
    }
  }
);

export const Timesheet = mongoose.model<ITimesheetDocument>(
  "Timesheet",
  timesheetSchema
);

