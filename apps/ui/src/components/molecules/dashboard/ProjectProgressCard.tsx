import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { IProjectProgress } from '../../../interfaces/dashboard/IDashboard';
import { format, differenceInDays } from 'date-fns';

const ProjectProgressCard: React.FC<IProjectProgress> = ({
  projectName,
  startDate,
  endDate,
}) => {
  const today = new Date();
  const totalDays = differenceInDays(endDate, startDate);
  const elapsedDays = differenceInDays(today, startDate);
  const remainingDays = differenceInDays(endDate, today);
  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  return (
    <Card
      elevation={1}
      sx={{
        mb: 2,
        transition: 'box-shadow 0.2s',
   
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {projectName}
          </Typography>
        </Box>
        
        <Box mb={1.5} position="relative">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 1,
              // backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: 'primary.main',
              },
            }}
          />
          {/* Today indicator line */}
          <Box
            sx={{
              position: 'absolute',
              left: `${progress}%`,
              top: -2,
              bottom: -2,
              width: 2,
              backgroundColor: 'error.main',
              zIndex: 1,
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </Typography>
          </Box>
          <Typography 
            variant="caption" 
            fontWeight={600} 
            color={remainingDays < 0 ? 'error.main' : 'success.main'}
          >
            {remainingDays < 0 ? `${Math.abs(remainingDays)}d overdue` : `${remainingDays}d remaining`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressCard;
