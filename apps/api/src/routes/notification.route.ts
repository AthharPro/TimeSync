import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} from '../controllers/notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authenticate());

// GET /api/notifications - Get user's notifications
router.get('/', getNotificationsHandler);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCountHandler);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', markAsReadHandler);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsReadHandler);

// DELETE /api/notifications/:notificationId - Delete a notification
router.delete('/:notificationId', deleteNotificationHandler);

export default router;
