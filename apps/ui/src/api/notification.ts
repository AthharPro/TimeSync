import API from '../config/apiClient';
import { INotification } from '@tms/shared';

/**
 * Get user's notifications
 */
export const getNotifications = async (limit = 50, skip = 0) => {
  const response = await API.get('/api/notifications', {
    params: { limit, skip },
  });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await API.get('/api/notifications/unread-count');
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await API.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  const response = await API.put('/api/notifications/read-all');
  return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string) => {
  const response = await API.delete(`/api/notifications/${notificationId}`);
  return response.data;
};
