import React from 'react';
import { Card, CardContent, Box, Avatar, Typography, Chip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import { ITeamMemberCardProps } from '../../../interfaces/project/ITeamView';

const TeamMemberCard: React.FC<ITeamMemberCardProps> = ({
  name,
  role,
  email,
  avatar,
  isManager = false,
  allocation,
}) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        width: 300,
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: isManager ? '2px solid' : 'none',
        borderColor: isManager ? 'primary.main' : 'transparent',
      }}
    >
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {/* Avatar */}
          <Box position="relative">
            <Avatar
              alt={name}
              src={avatar}
              sx={{
                width: 80,
                height: 80,
                fontSize: '2rem',
                bgcolor: isManager ? 'primary.main' : 'secondary.main',
              }}
            >
              {name.charAt(0)}
            </Avatar>
            
          </Box>

          {/* Name */}
          <Typography
            variant="h6"
            fontWeight={600}
            textAlign="center"
            sx={{ mt: isManager ? 1 : 0 }}
          >
            {name}
          </Typography>

          {/* Role */}
          <Box display="flex" alignItems="center" gap={1}>
            <WorkIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>

          {/* Email */}
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon fontSize="small" color="action" />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                wordBreak: 'break-word',
                textAlign: 'center',
              }}
            >
              {email}
            </Typography>
          </Box>

          {/* Allocation */}
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
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
