import React from 'react';
import { Box, Typography, Avatar, Divider, Chip, Grid } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { User, UserRole } from '@tms/shared';
import { useAuth } from '../../../contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ open, onClose, user: overrideUser }) => {
  const { user: authUser } = useAuth();
  
  // Use override user or auth user, fallback to dummy data
  const user = overrideUser ?? authUser ?? {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    employee_id: 'EMP001',
    designation: 'Software Engineer',
    contactNumber: '+1 234 567 8900',
    role: UserRole.Emp,
    status: true,
    isChangedPassword: true,
  };

  const getInitials = () => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case UserRole.SuperAdmin: return 'Super Admin';
      case UserRole.Admin: return 'Admin';
      case UserRole.SupervisorAdmin: return 'Supervisor Admin';
      case UserRole.Supervisor: return 'Supervisor';
      case UserRole.Emp: return 'Employee';
      default: return 'Employee';
    }
  };

  return (
    <PopupLayout
      open={open}
      title="Profile"
      onClose={onClose}
      maxWidth='xs'
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
          <BaseBtn variant="outlined" onClick={onClose}>
            Close
          </BaseBtn>
        </Box>
      }
    >
      {/* Profile Header Section - Avatar on Left, Details on Right */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, gap: 3 }}>
        {/* Left Side - Avatar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '1.5rem',
              bgcolor: 'grey.400',
            }}
          >
            {getInitials()}
          </Avatar>
        </Box>

        {/* Right Side - Details */}
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {user.firstName} {user.lastName}
          </Typography>
          
          {/* Designation with icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
            <WorkIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="body1">
              {user.designation}
            </Typography>
          </Box>

          {/* Role with icon */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminPanelSettingsIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="body2">
              {getRoleLabel()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Contact Information Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Contact Information
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Phone Number
            </Typography>
            <Typography variant="body1">{user.contactNumber}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Work Information Section */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Work Information
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Employee ID
            </Typography>
            <Typography variant="body1">{user.employee_id}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SupervisorAccountIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Supervisors
            </Typography>
            <Typography variant="body1">-</Typography>
          </Box>
        </Box>
      </Box>
    </PopupLayout>
  );
};

export default ProfilePopup;