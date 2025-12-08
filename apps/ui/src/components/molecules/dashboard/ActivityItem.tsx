import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { IRecentActivity } from '../../../interfaces/dashboard/IDashboard';

const ActivityItem: React.FC<IRecentActivity> = ({
  user,
  action,
  project,
  timestamp,
  avatar,
}) => {
  return (
    <Box
      display="flex"
      gap={2}
      p={2}
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        borderRadius: 1,
      }}
    >
      <Avatar alt={user} src={avatar} sx={{ width: 40, height: 40 }}>
        {user.charAt(0)}
      </Avatar>
      <Box flex={1}>
        <Typography variant="body2">
          <strong>{user}</strong> {action}{' '}
          <Typography component="span" color="primary" fontWeight={600}>
            {project}
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </Typography>
      </Box>
    </Box>
  );
};

export default ActivityItem;
