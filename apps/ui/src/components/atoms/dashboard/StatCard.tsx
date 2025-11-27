import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { IStatCard } from '../../../interfaces/dashboard/IDashboard';

const StatCard: React.FC<IStatCard> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {changeLabel && (
                  <Typography variant="caption" color="text.secondary">
                    {changeLabel}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color={ 'text.secondary' }
                  fontWeight={700}
                  fontSize={12}
                >
                  {change}
                </Typography>
                
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.01`,
              borderRadius: 0,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
              '& svg': {
                fontSize: '6rem', // Increased icon size
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
