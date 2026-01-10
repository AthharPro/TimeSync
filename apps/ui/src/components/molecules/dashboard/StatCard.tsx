import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { IStatCard } from '../../../interfaces/dashboard/IDashboard';

const StatCard: React.FC<IStatCard> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
  clickable = false,
  clickAction,
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0; 

  return (
    <Card
      elevation={2}
      onClick={clickable && clickAction ? clickAction : undefined}
      role={clickable && clickAction ? 'button' : undefined}
      tabIndex={clickable && clickAction ? 0 : undefined}
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        padding: 1,
        cursor: clickable && clickAction ? 'pointer' : undefined,
        '&:hover': clickable && clickAction ? { transform: 'translateY(-4px)', boxShadow: 4 } : undefined,
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
              
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
              '& svg': {
                fontSize: '2.5rem', 
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
