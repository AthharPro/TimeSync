import { RequestHandler } from 'express';
import { catchErrors } from '../utils';
import { OK } from '../constants';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
} from '../services/notification.service';

/**
 * Get notifications for the authenticated user
 */
export const getNotificationsHandler: RequestHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = parseInt(req.query.skip as string) || 0;

  const result = await getUserNotifications(userId, limit, skip);

  return res.status(OK).json(result);
});

/**
 * Get unread notification count for the authenticated user
 */
export const getUnreadCountHandler: RequestHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;

  const count = await getUnreadNotificationCount(userId);

  return res.status(OK).json({ unreadCount: count });
});

/**
 * Mark a notification as read
 */
export const markAsReadHandler: RequestHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const { notificationId } = req.params;

  const notification = await markNotificationAsRead(notificationId, userId);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  return res.status(OK).json({ message: 'Notification marked as read', notification });
});

/**
 * Mark all notifications as read
 */
export const markAllAsReadHandler: RequestHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;

  const count = await markAllNotificationsAsRead(userId);

  return res.status(OK).json({ 
    message: 'All notifications marked as read',
    markedCount: count 
  });
});

/**
 * Delete a notification
 */
export const deleteNotificationHandler: RequestHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const { notificationId } = req.params;

  const deleted = await deleteNotification(notificationId, userId);

  if (!deleted) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  return res.status(OK).json({ message: 'Notification deleted successfully' });
});
