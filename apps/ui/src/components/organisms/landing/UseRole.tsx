import React from 'react';
import { Box, Grid } from '@mui/material';
import { Person } from '@mui/icons-material';
import { SupervisorAccount } from '@mui/icons-material';
import { AdminPanelSettings } from '@mui/icons-material';
import RoleCard from '../../molecules/landing/RoleCard';
import SectionTitle from '../../atoms/landing/SectionTitle';
import { useTheme } from '@mui/material/styles';
import SectionContainer from '../../atoms/landing/SectionContainer';

const UseRole: React.FC = () => {
  const userRoles = [
    {
      icon: Person,
      title: 'Employees',
      description: 'Log hours, track tasks, and submit timesheets with ease.',
      features: ['Time logging', 'Timesheet submission'],
    },
    {
      icon: SupervisorAccount,
      title: 'Supervisors',
      description:
        'Manage team timesheets and approve submissions efficiently.',
      features: [
        ' Time logging',
        'Timesheet submission',
        'Timesheet approval',
      ],
    },
    {
      icon: AdminPanelSettings,
      title: 'Administrators',
      description: 'Comprehensive system management and advanced reporting.',
      features: [
        'User management',
        'Project Visibility',
        'Advanced reporting',
        'Timesheet approval',
        'Team management',
      ],
    },
  ];
  const theme = useTheme();
  return (
    <Box
      id="roles"
      sx={{
        py: 8,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
        scrollMarginTop: { xs: 80, sm: 96 },
      }}
    >
      <SectionContainer>
        <Box textAlign="center" mb={6}>
          <SectionTitle
            title="Built for Every Role"
            subtitle="Tailored experiences for employees, supervisors, and administrators"
          />
        </Box>
        <Grid container spacing={4}>
          {userRoles.map((role, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <RoleCard
                icon={role.icon}
                title={role.title}
                description={role.description}
                features={role.features}
              />
            </Grid>
          ))}
        </Grid>
      </SectionContainer>
    </Box>
  );
};

export default UseRole;
