import { DailyTimesheetStatus } from '@tms/shared';
import mongoose, { Schema } from "mongoose";
import { ITimesheetDocument } from '../interfaces';

const timesheetSchema = new Schema<ITimesheetDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: Object.values(DailyTimesheetStatus), default: DailyTimesheetStatus.Draft },
  date: { type: Date, required: true }, 
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  billable:{type:String},
  description: { type: String },
  hours: [{ type: String }],
}, {
  timestamps: true
});

export const Timesheet = mongoose.model<ITimesheetDocument>(
  "Timesheet",
  timesheetSchema
);

