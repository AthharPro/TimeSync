import React from 'react';
import { Box } from '@mui/material';
import { SupervisorAccount } from '@mui/icons-material';
import { ProfileFieldRow } from '../../atoms/profile';
import { ProfileWorkSectionProps } from '../../../interfaces/profile/molecule';


const ProfileWorkSection: React.FC<ProfileWorkSectionProps> = ({
  supervisorDisplay,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <ProfileFieldRow
      label="Supervisor"
      value={supervisorDisplay}
      icon={<SupervisorAccount fontSize="small" />}
    />
  </Box>
);

export default ProfileWorkSection;
