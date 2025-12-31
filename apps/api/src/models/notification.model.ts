import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '@tms/shared';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    relatedModel: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema
);
