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
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'task';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

// Dummy notification data
const dummyNotifications: Notification[] = [
  {
    id: '1',
    type: 'task',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Frontend Development"',
    time: '5 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Timesheet Approved',
    message: 'Your timesheet for last week has been approved',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Pending Timesheet',
    message: 'Please submit your timesheet for this week',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Project Update',
    message: 'Project "TimeSync" deadline extended to next week',
    time: '1 day ago',
    read: true,
  },
  {
    id: '5',
    type: 'task',
    title: 'Task Completed',
    message: 'John Doe completed the task "API Integration"',
    time: '2 days ago',
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'task':
      return <AssignmentIcon />;
    case 'success':
      return <CheckCircleIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
    default:
      return <ScheduleIcon />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'task':
      return '#1976d2';
    case 'success':
      return '#2e7d32';
    case 'warning':
      return '#ed6c02';
    case 'info':
    default:
      return '#0288d1';
  }
};

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  onClose,
}) => {
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
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Notifications
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 0, maxHeight: 360, overflow: 'auto' }}>
        {dummyNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          dummyNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                  cursor: 'pointer',
                }}
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
                        fontWeight: notification.read ? 400 : 600,
                        mb: 0.5,
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
                        {notification.time}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < dummyNotifications.length - 1 && <Divider />}
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
