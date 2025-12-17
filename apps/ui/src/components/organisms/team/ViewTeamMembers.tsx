import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import { useTheme } from '@mui/material/styles';
import SupervisorMemberCard from '../../molecules/common/SupervisorMemberCard';
import TeamMemberCard from '../../molecules/common/TeamMemberCard';
import BaseButton from '../../atoms/other/button/BaseBtn';
import { ViewTeamMembersProps } from '../../../interfaces/team/ITeam';

const ViewTeamMembers: React.FC<ViewTeamMembersProps> = ({
  open,
  onClose,
  team,
}) => {
  const theme = useTheme();
  if (!team) return null;

  const { teamName, supervisor, members } = team;
  const teamMembers = (members || []).filter((m) => m.id !== supervisor?.id);

  return (
    <PopupLayout
      open={open}
      title={`${teamName}`}
      onClose={onClose}
      maxWidth="xs"
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
          Supervisor
        </Typography>
        <SupervisorMemberCard supervisor={supervisor} />
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
            {teamMembers.map((employee) => (
              <TeamMemberCard key={employee.id} member={employee} />
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
    </PopupLayout>
  );
};

export default ViewTeamMembers;



