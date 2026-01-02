import { NotificationDTO } from '../types/notification.dto';

export const mapNotificationToDTO = (n: any): NotificationDTO => ({
  _id: n._id.toString(),
  userId: n.userId.toString(),
  type: n.type,
  title: n.title,
  message: n.message,
  relatedId: n.relatedId?.toString(),
  relatedModel: n.relatedModel,
  isRead: n.isRead,
  createdAt: n.createdAt,
  readAt: n.readAt,
});
