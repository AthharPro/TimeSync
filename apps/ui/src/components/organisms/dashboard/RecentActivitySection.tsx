import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { IRecentActivity } from '../../../interfaces/dashboard/IDashboard';
import ActivityItem from '../../molecules/dashboard/ActivityItem';

interface IRecentActivitySectionProps {
  activities: IRecentActivity[];
}

const RecentActivitySection: React.FC<IRecentActivitySectionProps> = ({ activities }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Latest team updates
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {activities.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentActivitySection;
