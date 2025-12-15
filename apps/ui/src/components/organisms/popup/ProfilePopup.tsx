import React from 'react';
import { Box, Divider } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseButton from '../../atoms/other/button/BaseBtn';
import { 
  ProfileHeader, 
  ProfileContactSection, 
  ProfileWorkSection 
} from '../../molecules/profile';
import { ProfileSectionLabel } from '../../atoms/profile';
// import { useSupervisorDisplay } from '../../../hooks/profile';
import { ProfilePopupProps } from '../../../interfaces/popup';

const ProfilePopup: React.FC<ProfilePopupProps> = ({ open, onClose, user: overrideUser }) => {
  // Dummy user data
  const dummyUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    contactNumber: '+94 782641293',
    role: 'Project Manager',
    designation: 'Senior PM',
  };

  const user = overrideUser ?? dummyUser;
  
//   const supervisorDisplay = useSupervisorDisplay({ user, open });

  return (
    <PopupLayout
      open={open}
      title="Profile"
      onClose={onClose}
      size='sm'
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
      {/* Profile Header Section */}
      <ProfileHeader
        firstName={user?.firstName}
        lastName={user?.lastName}
        role={user?.role}
        designation={user?.designation}
      />

      {/* Contact Information Section */}
      <ProfileContactSection
        email={user?.email}
        contactNumber={user?.contactNumber}
      />

      <Divider sx={{ my: 3 }} />

      {/* Work Information Section */}
      <ProfileSectionLabel label="Work Information" />
      <ProfileWorkSection supervisorDisplay={"No supervisor"} />
    </PopupLayout>
  );
};

export default ProfilePopup;