import { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Divider } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import EditTeamDetailsForm from '../../molecules/team/EditTeamDetailsForm';
import { IEmployee } from '../../../interfaces/user/IUser';
import StaffSelector from '../../molecules/common/StaffSelector';
import SupervisorSelector from '../../molecules/common/SupervisorSelector';
import SelectedEmployeeChips from '../../molecules/common/SelectedEmployeeChips';
import { ITeam } from '../../../interfaces/team/ITeam';
import { useTeam } from '../../../hooks/team';
import { getUsers } from '../../../api/user';
import BaseBtn from '../../atoms/other/button/BaseBtn';

interface EditTeamPopupProps {
  open: boolean;
  onClose: () => void;
  team: ITeam | null;
  onSaved?: () => void;
}

function EditTeamPopup({ open, onClose, team, onSaved }: EditTeamPopupProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { updateTeamStaff, loading: teamLoading } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<IEmployee[]>([]);
  const [supervisor, setSupervisor] = useState<string | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<IEmployee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTeamDetailsSaved = () => {
    onSaved && onSaved();
  };

  const mapUserToEmployee = (user: any): IEmployee => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const name =
      user.name ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      user.email ||
      'Unknown User';

    const id = user._id || user.id || user.employee_id || user.email;

    return {
      _id: user._id || id,
      id,
      name,
      firstName: firstName || name,
      lastName: lastName || '',
      email: user.email || '',
      designation: user.designation,
    };
  };

  // Load all users when the popup opens
  useEffect(() => {
    if (!open || !team) return;
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await getUsers();
        if (!isMounted) return;
        setEmployeeOptions(users.map(mapUserToEmployee));
      } catch (e: any) {
        if (!isMounted) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            'Failed to load employees'
        );
        setEmployeeOptions([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [open, team]);

  useEffect(() => {
    if (open && team) {
      setSelectedMembers(
        team.members.map((e) => ({
          _id: e.id,
          id: e.id,
          name: e.name,
          firstName: '',
          lastName: '',
          email: '',
          designation: e.designation || '',
        }))
      );
      setSupervisor(team.supervisor?.id || '');
      setSearchTerm('');
    }
  }, [open, team]);

  const filteredEmployees = useMemo(() => {
    const lc = searchTerm.toLowerCase();
    return employeeOptions
      .filter(
        (e) =>
          !selectedMembers.some(
            (sel) => (sel._id || sel.id) === (e._id || e.id)
          )
      )
      .filter((e) =>
        [e.name, e.email, e.designation]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(lc))
      );
  }, [employeeOptions, searchTerm, selectedMembers]);

  const handleEmployeeToggle = (employee: IEmployee) => {
    setSelectedMembers((prev) => {
      const exists = prev.some((e) => e.id === employee.id);
      if (exists) {
        const updated = prev.filter((e) => e.id !== employee.id);
        if (supervisor === employee.id) setSupervisor('');
        return updated;
      }
      return [...prev, employee];
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedMembers((prev) => prev.filter((e) => e.id !== employeeId));
    if (supervisor === employeeId) setSupervisor('');
  };

  const handleSaveStaff = async () => {
    if (!team) return;
    setIsLoading(true);
    setError(null);
    try {
      await updateTeamStaff(team.id, {
        members: selectedMembers.map((e) => e.id),
        supervisor: supervisor || null,
      });
      onSaved && onSaved();
      onClose();
    } catch (e: any) {
      console.error('Failed to update team staff:', e);
      const errorMessage = e?.message || 'Failed to update team staff. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!team) return null;

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title={`Edit Team: ${team.teamName}`}
      maxWidth="lg"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Team Details" />
          <Tab label="Staff Manager" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <EditTeamDetailsForm
          team={team}
          onClose={onClose}
          onSaved={handleTeamDetailsSaved}
        />
      )}

      {activeTab === 1 && (
        <Box>
          {error && (
            <Box sx={{ color: 'error.main', mb: 1, fontSize: 14 }}>{error}</Box>
          )}
          <SelectedEmployeeChips
            employees={selectedMembers}
            onRemove={handleRemoveEmployee}
            title="Selected Employees"
            sx={{ mb: 2 }}
          />
          <SupervisorSelector
            selectedEmployees={selectedMembers}
            supervisor={supervisor}
            onSupervisorChange={setSupervisor}
            caption="Choose a supervisor from selected team members"
          />
          <StaffSelector
            selectedEmployees={selectedMembers}
            availableEmployees={filteredEmployees}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEmployeeToggle={handleEmployeeToggle}
            onRemoveEmployee={handleRemoveEmployee}
            title="Add more team members"
          />
          <Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <BaseBtn
              type="button"
              onClick={onClose}
              variant="outlined"
              disabled={isLoading}
            >
              Cancel
            </BaseBtn>
            <BaseBtn onClick={handleSaveStaff} variant="contained" disabled={isLoading || teamLoading}>
              {isLoading || teamLoading ? 'Saving...' : 'Save'}
            </BaseBtn>
          </Box>
        </Box>
      )}
    </PopupLayout>
  );
}

export default EditTeamPopup;
