import React, { useState, useEffect } from 'react';
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
import { getMyMemberTeams } from '../../../api/team';
import { listProjects } from '../../../api/project';

interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ open, onClose, user: overrideUser }) => {
  const { user: authUser } = useAuth();
  const [supervisors, setSupervisors] = useState<Array<{ name: string; email: string }>>([]); 
  const [loading, setLoading] = useState(false);
  
  // Use override user or auth user, fallback to dummy data
  const user = overrideUser ?? authUser ?? {
    _id: '',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    employee_id: 'EMP001',
    designation: 'Software Engineer',
    contactNumber: '+1 234 567 8900',
    role: UserRole.Emp,
    status: true,
    isChangedPwd: true,
  };

  // Fetch supervisors when popup opens
  useEffect(() => {
    const fetchSupervisors = async () => {
      const userId = user?._id;
      if (!open || !userId) return;
      
      setLoading(true);
      const supervisorMap = new Map<string, { name: string; email: string }>();
      
      try {
        // Fetch teams where user is a member
        const teamsResponse = await getMyMemberTeams();
        if (teamsResponse?.teams) {
          teamsResponse.teams.forEach((team: any) => {
            if (team.supervisor && typeof team.supervisor === 'object') {
              const supervisorId = team.supervisor._id;
              const supervisorName = `${team.supervisor.firstName} ${team.supervisor.lastName}`;
              const supervisorEmail = team.supervisor.email || '';
              
              if (!supervisorMap.has(supervisorId)) {
                supervisorMap.set(supervisorId, { 
                  name: supervisorName, 
                  email: supervisorEmail 
                });
              }
            }
          });
        }
        
        // Fetch all projects and filter by user
        const projectsResponse = await listProjects();
        if (projectsResponse?.projects) {
          // Filter projects where user is assigned
          const userProjects = projectsResponse.projects.filter((project: any) => 
            project.employees?.some((emp: any) => {
              const empId = typeof emp === 'string' ? emp : emp.user?._id || emp.user;
              return empId === userId;
            })
          );
          
          userProjects.forEach((project: any) => {
            if (project.supervisor && typeof project.supervisor === 'object') {
              const supervisorId = project.supervisor._id;
              const supervisorName = `${project.supervisor.firstName} ${project.supervisor.lastName}`;
              const supervisorEmail = project.supervisor.email || '';
              
              if (!supervisorMap.has(supervisorId)) {
                supervisorMap.set(supervisorId, { 
                  name: supervisorName, 
                  email: supervisorEmail 
                });
              }
            }
          });
        }
        
        setSupervisors(Array.from(supervisorMap.values()));
      } catch (error) {
        console.error('Error fetching supervisors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupervisors();
  }, [open, user?._id]);

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

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <SupervisorAccountIcon sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Supervisors
            </Typography>
            {loading ? (
              <Typography variant="body1">Loading...</Typography>
            ) : supervisors.length > 0 ? (
              <Box sx={{ mt: 1 }}>
                {supervisors.map((supervisor, index) => (
                  <Box key={index} sx={{ mb: index < supervisors.length - 1 ? 1.5 : 0 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {supervisor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {supervisor.email}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1">No supervisors assigned</Typography>
            )}
          </Box>
        </Box>
      </Box>
    </PopupLayout>
  );
};

export default ProfilePopup;