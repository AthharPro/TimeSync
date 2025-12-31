import { NotificationType } from '../enums';

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}
