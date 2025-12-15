import React from 'react';
import { Box } from '@mui/material';
import { Email, Phone } from '@mui/icons-material';
import { ProfileFieldRow, ProfileSectionLabel } from '../../atoms/profile';
import { ProfileContactSectionProps } from '../../../interfaces/profile/molecule';
import { ContactNumberFormat } from '../../../utils';

const ProfileContactSection: React.FC<ProfileContactSectionProps> = ({
  email,
  contactNumber,
}) => (
  <>
    <ProfileSectionLabel label="Contact Information" />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      <ProfileFieldRow
        label="Email Address"
        value={email}
        icon={<Email fontSize="small" />}
      />
      <ProfileFieldRow
        label="Phone Number"
        value={ContactNumberFormat(contactNumber)}
        icon={<Phone fontSize="small" />}
      />
    </Box>
  </>
);

export default ProfileContactSection;
