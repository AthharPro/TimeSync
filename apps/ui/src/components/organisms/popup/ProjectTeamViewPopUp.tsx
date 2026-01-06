import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import PopUpLayout from '../../templates/popup/PopUpLayout';
import { useTheme } from '@mui/material/styles';
import SupervisorMemberCard from '../../molecules/common/SupervisorMemberCard';
import TeamMemberCard from '../../molecules/common/TeamMemberCard';
import BaseButton from '../../atoms/other/button/BaseBtn';
import { ITeamViewModalProps } from '../../../interfaces/project/ITeamView';

const ProjectTeamViewPopUp: React.FC<ITeamViewModalProps> = ({ open, onClose, project }) => {
  const theme = useTheme();
  
  const managerMember = project.teamMembers.find(
    (member) => member.id === project.supervisor
  );
  const teamMembers = project.teamMembers.filter(
    (member) => member.id !== project.supervisor
  );

  return (
    <PopUpLayout
      open={open}
      onClose={onClose}
      title={`${project.projectName}`}
      maxWidth="md"
      actions={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <BaseButton variant="outlined" onClick={onClose}>
            Cancel
          </BaseButton>
        </Box>
      }
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: theme.palette.text.primary }}
          gutterBottom
        >
          Project Manager
        </Typography>
        <SupervisorMemberCard 
          supervisor={managerMember ? {
            name: managerMember.name,
            designation: managerMember.role,
            email: managerMember.email || `${managerMember.name.toLowerCase().replace(' ', '.')}@company.com`
          } : null}
          allocation={managerMember?.allocation}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography
          variant="h6"
          sx={{ color: theme.palette.text.primary }}
          gutterBottom
        >
          Team Members ({teamMembers.length})
        </Typography>
        {teamMembers.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {teamMembers.map((member) => (
              <TeamMemberCard 
                key={member.id} 
                member={{
                  id: member.id,
                  name: member.name,
                  designation: member.role,
                  email: member.email || `${member.name.toLowerCase().replace(' ', '.')}@company.com`
                }}
                allocation={member.allocation}
              />
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            No team members assigned
          </Typography>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
    </PopUpLayout>
  );
};

export default ProjectTeamViewPopUp;
