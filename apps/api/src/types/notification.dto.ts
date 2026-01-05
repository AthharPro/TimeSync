export interface NotificationDTO {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}