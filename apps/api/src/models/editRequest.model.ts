import mongoose, { Schema } from "mongoose";
import { IEditRequestDocument } from '../interfaces';

export enum EditRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

const editRequestSchema = new Schema<IEditRequestDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true }, // Format: 'YYYY-MM'
  year: { type: String, required: true }, // Format: 'YYYY'
  status: { 
    type: String, 
    enum: Object.values(EditRequestStatus), 
    default: EditRequestStatus.Pending,
    index: true 
  },
  requestDate: { type: Date, default: Date.now, required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  approvedDate: { type: Date, required: false },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  rejectedDate: { type: Date, required: false },
  rejectionReason: { type: String, required: false }
}, {
  timestamps: true
});

// Compound index to prevent duplicate edit requests for the same user and month
editRequestSchema.index(
  { userId: 1, month: 1, year: 1 },
  { 
    unique: true,
    partialFilterExpression: {
      status: EditRequestStatus.Pending
    }
  }
);

export const EditRequest = mongoose.model<IEditRequestDocument>(
  "EditRequest",
  editRequestSchema
);
