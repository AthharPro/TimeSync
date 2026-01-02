import mongoose from 'mongoose';
import { NotificationModel, INotificationDocument } from '../models/notification.model';
import { NotificationType } from '@tms/shared';
import { io } from '../main';
import { mapNotificationToDTO } from '../utils/notification.mapper';
import { NotificationDTO } from '../types/notification.dto';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
}

/**
 * Create a notification and send it via Socket.io
 */
export const createNotification = async (
  params: CreateNotificationParams
): Promise<INotificationDocument> => {
  const notification = new NotificationModel({
    userId: new mongoose.Types.ObjectId(params.userId),
    type: params.type,
    title: params.title,
    message: params.message,
    relatedId: params.relatedId ? new mongoose.Types.ObjectId(params.relatedId) : undefined,
    relatedModel: params.relatedModel,
    isRead: false,
  });

  await notification.save();

  // Send notification via Socket.io to the user's room
  io.to(`user:${params.userId}`).emit('notification', {
    _id: notification._id.toString(),
    userId: notification.userId.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedId: notification.relatedId?.toString(),
    relatedModel: notification.relatedModel,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  return notification;
};

/**
 * Create notifications for multiple users (e.g., all supervisors)
 */
export const createBulkNotifications = async (
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
): Promise<INotificationDocument[]> => {
  const notifications = await Promise.all(
    userIds.map((userId) =>
      createNotification({
        ...params,
        userId,
      })
    )
  );

  return notifications;
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (
  userId: string,
  limit = 50,
  skip = 0
): Promise<{ notifications: NotificationDTO[]; total: number; unreadCount: number }> => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [notifications, total, unreadCount] = await Promise.all([
    NotificationModel.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean(),
    NotificationModel.countDocuments({ userId: userObjectId }),
    NotificationModel.countDocuments({ userId: userObjectId, isRead: false }),
  ]);

  return {
    notifications: notifications.map(mapNotificationToDTO),
    total,
    unreadCount,
  };
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<NotificationDTO | null> => {
  const notification = await NotificationModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!notification) return null;

  return mapNotificationToDTO(notification); 
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  const result = await NotificationModel.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const count = await NotificationModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false,
  });

  return count;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<boolean> => {
  const result = await NotificationModel.deleteOne({
    _id: new mongoose.Types.ObjectId(notificationId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  return result.deletedCount > 0;
};
