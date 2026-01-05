import React from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { INotification, NotificationType } from '@tms/shared';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { useWindowNavigation } from '../../../hooks/useWindowNavigation';
import dayjs from 'dayjs';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}


const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.TimesheetSubmitted:
    case NotificationType.TimesheetEditRequest:
      return <AssignmentIcon />;
    case NotificationType.TimesheetApproved:
    case NotificationType.TimesheetEditApproved:
      return <CheckCircleIcon />;
    case NotificationType.TimesheetRejected:
    case NotificationType.TimesheetEditRejected:
      return <WarningIcon />;
    case NotificationType.TimesheetReminder:
    case NotificationType.ProjectAssignment:
    case NotificationType.TeamAssignment:
    default:
      return <ScheduleIcon />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.TimesheetSubmitted:
    case NotificationType.ProjectAssignment:
    case NotificationType.TeamAssignment:
      return '#1976d2';
    case NotificationType.TimesheetApproved:
    case NotificationType.TimesheetEditApproved:
      return '#2e7d32';
    case NotificationType.TimesheetRejected:
    case NotificationType.TimesheetEditRejected:
      return '#d32f2f';
    case NotificationType.TimesheetReminder:
    case NotificationType.TimesheetEditRequest:
    default:
      return '#ed6c02';
  }
};

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext();

  const { setSelectedButton, setReviewTimesheetParams, setMyTimesheetParams } = useWindowNavigation();

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Handle TimesheetSubmitted notification - navigate to Review Timesheets
    if (notification.type === NotificationType.TimesheetSubmitted) {
      // relatedId contains the employee's user ID who submitted the timesheet
      const employeeId = notification.relatedId;
      
      if (employeeId) {
        // Extract month from notification createdAt date or current month
        const notificationDate = dayjs(notification.createdAt);
        const month = notificationDate.format('YYYY-MM');
        
        // Set navigation parameters
        setReviewTimesheetParams({
          employeeId,
          month,
          status: 'Pending'
        });
        
        // Navigate to Review Timesheets
        setSelectedButton('Review Timesheets');
      }
      
      // Close the notification popover
      onClose();
    }

    // Handle TimesheetRejected notification - navigate to My Timesheets
    if (notification.type === NotificationType.TimesheetRejected) {
      // Extract year and month from notification createdAt date
      const notificationDate = dayjs(notification.createdAt);
      const year = notificationDate.format('YYYY');
      const month = notificationDate.format('YYYY-MM');
      
      // Set navigation parameters for My Timesheets
      setMyTimesheetParams({
        year,
        month,
        status: 'Rejected'
      });
      
      // Navigate to My Timesheets
      setSelectedButton('My Timesheets');
      
      // Close the notification popover
      onClose();
    }

    // Handle TimesheetEditRequest notification - navigate to Review Timesheets, Edit Request tab
    if (notification.type === NotificationType.TimesheetEditRequest) {
      // Set navigation parameters to open Edit Request tab with Pending filter
      setReviewTimesheetParams({
        tab: 'editRequest',
        editRequestStatus: 'Pending'
      });
      
      // Navigate to Review Timesheets
      setSelectedButton('Review Timesheets');
      
      // Close the notification popover
      onClose();
    }

    // Handle TimesheetApproved notification - navigate to My Timesheets
    if (notification.type === NotificationType.TimesheetApproved) {
      // Extract year and month from notification createdAt date
      const notificationDate = dayjs(notification.createdAt);
      const year = notificationDate.format('YYYY');
      const month = notificationDate.format('YYYY-MM');
      
      // Set navigation parameters for My Timesheets
      setMyTimesheetParams({
        year,
        month,
        status: 'Approved'
      });
      
      // Navigate to My Timesheets
      setSelectedButton('My Timesheets');
      
      // Close the notification popover
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent notification click
    deleteNotification(notificationId);
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: 380,
            maxHeight: 500,
          },
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
            {unreadCount > 0 && (
              <Typography
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'error.main',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {unreadCount}
              </Typography>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead} sx={{ textTransform: 'none' }}>
              Mark all as read
            </Button>
          )}
        </Box>
      </Box>
      <Divider />
      <List sx={{ p: 0, maxHeight: 360, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notification, index) => (
            <React.Fragment key={notification._id}>
              <ListItem
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: getNotificationColor(notification.type),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: notification.isRead ? 400 : 600,
                        mb: 0.5,
                        pr: 4, // Make room for delete button
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </ListItem>
              {index < notifications.slice(0, 10).length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
      <Divider />
      <Box sx={{ p: 1.5, textAlign: 'center' }}>
        <Button
          fullWidth
          size="small"
          sx={{ textTransform: 'none' }}
          onClick={onClose}
        >
          View All Notifications
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationPopover;
