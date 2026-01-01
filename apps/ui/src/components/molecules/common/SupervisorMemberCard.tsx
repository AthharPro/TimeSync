import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ISupervisorMemberCardProps } from '../../../interfaces/team/ITeam';

const SupervisorMemberCard: React.FC<ISupervisorMemberCardProps> = ({
  supervisor,
  allocation,
}) => {
  const theme = useTheme();

  if (!supervisor) {
    return (
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        No supervisor assigned
      </Typography>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        position: 'relative',
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.text.secondary}`,
        borderRadius: 2,
        '&:hover': {
          borderColor: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {supervisor.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {supervisor.designation || 'No designation'}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {supervisor.email || 'No email'}
        </Typography>
        {allocation !== undefined && (
          <Chip
            label={`${allocation}% Allocated`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              mt: 1,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default SupervisorMemberCard;
