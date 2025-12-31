import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { INotification, NotificationType } from '@tms/shared';
import { initializeSocket } from '../services/socketService';
import {
  getNotifications as fetchNotificationsApi,
  markNotificationAsRead as markAsReadApi,
  markAllNotificationsAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
} from '../api/notification';
import { useSnackbar } from 'notistack';

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const NotificationProvider = ({ children, userId }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await fetchNotificationsApi(50, 0);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initialize socket connection and listen for new notifications
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ No userId provided, skipping socket initialization');
      return;
    }

    console.log('🔌 Initializing notifications for user:', userId);

    // Initialize socket connection
    const socket = initializeSocket(userId);

    // Listen for new notifications
    const handleNewNotification = (notification: INotification) => {
      console.log('📬 New notification received:', notification);

      // Add to the beginning of the notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Increment unread count if not read
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show toast notification
      const variant = notification.type === NotificationType.TimesheetRejected ? 'error' : 
                     notification.type === NotificationType.TimesheetApproved ? 'success' : 
                     'info';

      enqueueSnackbar(notification.message, {
        variant,
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    };

    socket.on('notification', handleNewNotification);

    // Fetch initial notifications
    fetchNotifications();

    // Cleanup - remove listener when component unmounts or userId changes
    return () => {
      console.log('🔌 Cleaning up socket listener for user:', userId);
      socket.off('notification', handleNewNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only re-run when userId changes

  // Mark a notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadApi(notificationId);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );

        // Decrement unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        enqueueSnackbar('Failed to mark notification as read', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await markAllAsReadApi();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );

      setUnreadCount(0);

      enqueueSnackbar(`${result.markedCount} notifications marked as read`, {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      enqueueSnackbar('Failed to mark all notifications as read', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await deleteNotificationApi(notificationId);

        // Find if the deleted notification was unread
        const wasUnread = notifications.find((n) => n._id === notificationId)?.isRead === false;

        // Remove from local state
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

        // Decrement unread count if it was unread
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        enqueueSnackbar('Notification deleted', { variant: 'success' });
      } catch (error) {
        console.error('Error deleting notification:', error);
        enqueueSnackbar('Failed to delete notification', { variant: 'error' });
      }
    },
    [notifications, enqueueSnackbar]
  );

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
