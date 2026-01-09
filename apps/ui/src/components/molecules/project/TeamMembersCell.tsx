import React from 'react';
import { Box, AvatarGroup, Avatar, Tooltip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { ITeamMembersCellProps } from '../../../interfaces/project/IProjectCells';
import { BaseBtn } from '../../atoms';

const TeamMembersCell: React.FC<ITeamMembersCellProps> = ({
  teamMembers,
  onViewTeam,
  disabled = false,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} minHeight="40px">
      
      <BaseBtn
        size="small"
        variant="outlined"
        startIcon={<GroupIcon />}
        onClick={onViewTeam}
        disabled={disabled || !onViewTeam}
      >
        View Team
      </BaseBtn>
    </Box>
  );
};

export default TeamMembersCell;
