import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TeamMemberCardProps } from '../../../interfaces/team/ITeam';

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, allocation }) => {
  const theme = useTheme();
  if (!member) {
    return (
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        No member assigned
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
        borderRadius: 3,
        '&:hover': {
          borderColor: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box>
        <Typography variant="subtitle2" fontWeight="bold">
          {member.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {member.designation || 'No designation'}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {member.email || 'No email'}
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

export default TeamMemberCard;
