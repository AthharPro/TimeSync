import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { IProjectProgress } from '../../../interfaces/dashboard/IDashboard';
import StatusBadge from '../../atoms/dashboard/StatusBadge';

const ProjectProgressCard: React.FC<IProjectProgress> = ({
  projectName,
  progress,
  daysLeft,
  status,
}) => {
  return (
    <Card
      elevation={1}
      sx={{
        mb: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {projectName}
          </Typography>
          <StatusBadge status={status} />
        </Box>
        
        <Box mb={1.5}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'white',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor:
                  status === 'On Track'
                    ? 'success.main'
                    : status === 'At Risk'
                    ? 'warning.main'
                    : 'error.main',
              },
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {daysLeft} days remaining
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressCard;
