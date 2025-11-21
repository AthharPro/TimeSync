import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { IProjectProgress } from '../../../interfaces/dashboard/IDashboard';
import ProjectProgressCard from '../../molecules/dashboard/ProjectProgressCard';

interface IProjectProgressSectionProps {
  projects: IProjectProgress[];
}

const ProjectProgressSection: React.FC<IProjectProgressSectionProps> = ({ projects }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Project Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Track ongoing project status
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {projects.map((project) => (
            <ProjectProgressCard key={project.id} {...project} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressSection;
