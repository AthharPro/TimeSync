import React from 'react';
import { Box, AvatarGroup, Avatar, Tooltip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { ITeamMember } from '../../../interfaces/project/IProject';
import { BaseBtn } from '../../atoms';

interface ITeamMembersCellProps {
  teamMembers: ITeamMember[];
  onViewTeam?: () => void;
}

const TeamMembersCell: React.FC<ITeamMembersCellProps> = ({
  teamMembers,
  onViewTeam,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
      {/* <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14 } }}>
        {teamMembers.map((member) => (
          <Tooltip key={member.id} title={member.name}>
            <Avatar alt={member.name} src={member.avatar}>
              {member.name.charAt(0)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup> */}
      <BaseBtn
        size="small"
        variant="outlined"
        startIcon={<GroupIcon />}
        onClick={onViewTeam}
      >
        View Team
      </BaseBtn>
    </Box>
  );
};

export default TeamMembersCell;
