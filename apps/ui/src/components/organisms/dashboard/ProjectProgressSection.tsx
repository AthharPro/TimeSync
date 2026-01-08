import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { IProjectProgressSectionProps } from '../../../interfaces/project/IProject';
import ProjectProgressCard from '../../molecules/dashboard/ProjectProgressCard';

const ProjectProgressSection: React.FC<IProjectProgressSectionProps> = ({ projects }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Project Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Track project timelines and deadlines
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
