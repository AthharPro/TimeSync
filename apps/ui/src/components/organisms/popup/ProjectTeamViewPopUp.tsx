import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PopUpLayout from '../../templates/popup/PopUpLayout';
import TeamMemberCard from '../../molecules/project/TeamMemberCard';
import { ITeamViewModalProps } from '../../../interfaces/project/ITeamView';

const TeamViewModal: React.FC<ITeamViewModalProps> = ({ open, onClose, project }) => {
  const totalMembers = project.teamMembers.length + 1; // +1 for project manager

  return (
    <PopUpLayout
      open={open}
      onClose={onClose}
      title={`Team Members - ${project.projectName}`}
      subtitle={`View all team members and project manager`}
      maxWidth="lg"
      size='md'
    >
      <Box>
        
        {/* Project Manager Section */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Project Manager
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
            <TeamMemberCard
                name={project.projectManager.name}
                role="Project Manager"
                email={project.projectManager.email}
                avatar={project.projectManager.avatar}
                isManager={true}
                allocation={project.projectManager.allocation}
              />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Team Members Section */}
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Team Members ({project.teamMembers.length})
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
            {project.teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                  name={member.name}
                  role={member.role}
                email={member.email || `${member.name.toLowerCase().replace(' ', '.')}@company.com`}
                avatar={member.avatar}
                isManager={false}
                allocation={member.allocation}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </PopUpLayout>
  );
};

export default TeamViewModal;
