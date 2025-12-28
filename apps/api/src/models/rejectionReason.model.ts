import mongoose, { Schema } from "mongoose";
import { ITimesheetRejectionDocument } from '../interfaces';

const timesheetRejectionSchema = new Schema<ITimesheetRejectionDocument>({
  timesheetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Timesheet', 
    required: true, 
    index: true 
  },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rejectionReason: { 
    type: String, 
    required: true 
  },
  rejectedAt: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
}, {
  timestamps: true
});

// Create compound index to track rejection history
timesheetRejectionSchema.index({ timesheetId: 1, rejectedAt: -1 });

export const TimesheetRejection = mongoose.model<ITimesheetRejectionDocument>(
  "TimesheetRejection",
  timesheetRejectionSchema
);
