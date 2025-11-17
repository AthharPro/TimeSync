import React from 'react';
import Box from '@mui/material/Box';
import { AccessTime, Assessment, Group, Dashboard } from '@mui/icons-material';
import SectionTitle from '../../atoms/landing/SectionTitle';
import ScrollingCard from '../../molecules/landing/ScrollingCard';
import { FeatureCardProps } from '../../../interfaces/landing';
import { useTheme } from '@mui/material/styles';
import SectionContainer from '../../atoms/landing/SectionContainer';

const Feature: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: AccessTime,
      title: 'Time Tracking',
      description:
        'Efficiently log hours, track project time, and manage daily activities with our intuitive timesheet interface.',
    },
    {
      icon: Assessment,
      title: 'Project Management',
      description:
        'Organize projects and monitor progress with comprehensive project tracking capabilities.',
    },
    {
      icon: Group,
      title: 'Team Collaboration',
      description:
        'Foster teamwork with role-based access, team management, and collaborative timesheet approval workflows.',
    },
    {
      icon: Dashboard,
      title: 'Analytics & Reports',
      description:
        'Generate detailed reports, track productivity metrics, and gain insights into team performance.',
    },
  ];
  const theme = useTheme();
  return (
    <Box
      id="features"
      sx={{
        py: 8,
        bgcolor: theme.palette.background.default,
        scrollMarginTop: { xs: 80, sm: 96 },
      }}
    >
     <SectionContainer>
        <Box textAlign="center" mb={6}>
          <SectionTitle
            title="Powerful Features"
            subtitle="Everything you need to manage time, projects, and teams effectively"
          />
        </Box>

        <ScrollingCard items={features} animationDuration={30} />
      </SectionContainer>
    </Box>
  );
};

export default Feature;