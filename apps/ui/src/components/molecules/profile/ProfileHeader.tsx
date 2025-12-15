import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Badge, Person } from '@mui/icons-material';
import { ProfileAvatar } from '../../atoms/profile';
import { UserRole } from '@tms/shared';
import { useTheme } from '@mui/material/styles';
import { ProfileHeaderProps } from '../../../interfaces/profile/molecule';

const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.Emp:
      return 'Employee';
    case UserRole.Admin:
      return 'Admin';
    case UserRole.Supervisor:
      return 'Supervisor';
    case UserRole.SupervisorAdmin:
      return 'Supervisor Admin';
    case UserRole.SuperAdmin:
      return 'Super Admin';
    default:
      return role;
  }
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  lastName,
  role,
  designation,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.palette.background.default,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={4}>
        <ProfileAvatar firstName={firstName} lastName={lastName} />

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: theme.palette.text.primary,
              letterSpacing: '-0.5px',
            }}
          >
            {firstName} {lastName}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {role && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: '1rem',
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  {getRoleDisplayName(role)}
                </Typography>
              </Box>
            )}

            {designation && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: '1rem',
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                  }}
                >
                  {designation}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;
