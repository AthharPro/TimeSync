import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import PopUpLayout from '../../templates/popup/PopUpLayout';
import TeamMemberCard from '../../molecules/project/TeamMemberCard';
import { ITeamViewModalProps } from '../../../interfaces/project/ITeamView';

const ProjectTeamViewPopUp: React.FC<ITeamViewModalProps> = ({ open, onClose, project }) => {
  const managerMember = project.teamMembers.find(
    (member) => member.id === project.supervisor
  );
  const totalMembers = project.teamMembers.length + (managerMember ? 1 : 0);

  return (
    <PopUpLayout
      open={open}
      onClose={onClose}
      title={`Team Members - ${project.projectName}`}
      subtitle={`View all team members and project manager (${totalMembers})`}
      maxWidth="md"
    >
      <Box>
        {/* Project Manager Section */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Project Manager
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 1,
            }}
          >
            {managerMember ? (
              <TeamMemberCard
                name={managerMember.name}
                role="Project Manager"
                email={
                  managerMember.email ||
                  `${managerMember.name.toLowerCase().replace(' ', '.')}@company.com`
                }
                avatar={managerMember.avatar}
                isManager={true}
                allocation={managerMember.allocation}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No project manager assigned.
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Team Members Section */}
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Team Members ({project.teamMembers.length})
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 1,
            }}
          >
            {project.teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                name={member.name}
                role={member.role}
                email={
                  member.email ||
                  `${member.name.toLowerCase().replace(' ', '.')}@company.com`
                }
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

export default ProjectTeamViewPopUp;
