import mongoose from 'mongoose';
import { IHistoryDocument, HistoryActionType, HistoryEntityType } from '../interfaces/history';

const historySchema = new mongoose.Schema<IHistoryDocument>(
  {
    actionType: {
      type: String,
      enum: Object.values(HistoryActionType),
      required: true,
    },
    entityType: {
      type: String,
      enum: Object.values(HistoryEntityType),
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },
    entityName: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
    performedByEmail: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
historySchema.index({ createdAt: -1 });
historySchema.index({ entityType: 1, entityId: 1 });
historySchema.index({ performedBy: 1 });

const HistoryModel = mongoose.model<IHistoryDocument>('History', historySchema);
export default HistoryModel;
