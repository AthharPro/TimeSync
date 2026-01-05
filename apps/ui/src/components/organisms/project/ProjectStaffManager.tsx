import { useEffect, useMemo, useState } from 'react';
import { Box, Divider } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { IEmployee } from '../../../interfaces/user/IUser';
import StaffSelector from '../../molecules/common/StaffSelector';
import SupervisorSelector from '../../molecules/common/SupervisorSelector';
import SelectedEmployeeChips from '../../molecules/common/SelectedEmployeeChips';
import { ProjectStaffManagerProps } from '../../../interfaces/project/IProject';
import { useProjects } from '../../../hooks/project/useProjects';
import { getUsers } from '../../../api/user';

export default function ProjectStaffManager({
  open,
  onClose,
  projectId,
  initialEmployees,
  initialSupervisor,
  onSaved,
}: ProjectStaffManagerProps) {
  const { updateProjectStaff } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>([]);
  const [supervisor, setSupervisor] = useState<string | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<IEmployee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mapUserToEmployee = (user: unknown): IEmployee => {
    const userRecord = user as Record<string, unknown>;
    const firstName = (userRecord.firstName as string) || '';
    const lastName = (userRecord.lastName as string) || '';
    const name =
      (userRecord.name as string) ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      (userRecord.email as string) ||
      'Unknown User';

    const id = (userRecord._id as string) || (userRecord.id as string) || (userRecord.employee_id as string) || (userRecord.email as string);

    return {
      _id: (userRecord._id as string) || id,
      id,
      name,
      firstName: firstName || name,
      lastName: lastName || '',
      email: (userRecord.email as string) || '',
      designation: userRecord.designation as string,
    };
  };

  // Load all users when the popup opens
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await getUsers();
        if (!isMounted) return;
        setEmployeeOptions(users.map(mapUserToEmployee));
      } catch (e: unknown) {
        if (!isMounted) {
          setIsLoading(false);
          return;
        }
        const error = e as { response?: { data?: { message?: string } }; message?: string };
        setError(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load employees'
        );
        setEmployeeOptions([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Initialize selected employees and supervisor from props
  useEffect(() => {
    if (open) {
      setSelectedEmployees(
        (initialEmployees || []).map((e) => ({
          _id: e.id,
          id: e.id,
          name: e.name,
          firstName: '',
          lastName: '',
          email: '',
          designation: e.designation || '',
          allocation: (e as any).allocation ?? 0,
        }))
      );
      setSupervisor(initialSupervisor?.id || '');
      setSearchTerm('');
    }
  }, [open, initialEmployees, initialSupervisor]);

  const filteredEmployees = useMemo(() => {
    const lc = searchTerm.toLowerCase();
    return employeeOptions
      .filter(
        (e) =>
          !selectedEmployees.some(
            (sel) => (sel._id || sel.id) === (e._id || e.id)
          )
      )
      .filter((e) =>
        [e.name, e.email, e.designation]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(lc))
      );
  }, [employeeOptions, searchTerm, selectedEmployees]);

  const handleEmployeeToggle = (employee: IEmployee) => {
    setSelectedEmployees((prev) => {
      const exists = prev.some((e) => e.id === employee.id);
      if (exists) {
        const updated = prev.filter((e) => e.id !== employee.id);
        if (supervisor === employee.id) setSupervisor('');
        return updated;
      }
      return [...prev, { ...employee, allocation: (employee as any).allocation ?? 0 }];
    });
  };

  const handleAllocationChange = (employeeId: string, allocation: number) => {
    setSelectedEmployees((prev) =>
      prev.map((p) => (p.id === employeeId || p._id === employeeId ? { ...p, allocation } : p))
    );
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    if (supervisor === employeeId) setSupervisor('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProjectStaff(projectId, {
        employees: selectedEmployees.map((e) => ({ user: e.id, allocation: e.allocation ?? 0 })),
        supervisor: supervisor || null,
      });
      onSaved?.();
      onClose();
    } catch (e: unknown) {
      console.error('Failed to update project staff:', e);
      const error = e as { response?: { data?: { message?: string } }; message?: string };
      setError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update project staff'
      );
    } finally {
      setIsLoading(false);
    }
  };

 

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title="Manage Project Members"
      subtitle="Add or remove project members and set a supervisor"
      maxWidth='md'
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        {error && (
          <Box sx={{ color: 'error.main', mb: 1, fontSize: 14 }}>{error}</Box>
        )}
        <Box sx={{ flex: '0 0 50%'}}>
          <SelectedEmployeeChips
          employees={selectedEmployees}
          onRemove={handleRemoveEmployee}
          onAllocationChange={handleAllocationChange}
          title="Selected Employees"
          sx={{ mb: 2 }}
        />
        <SupervisorSelector
          selectedEmployees={selectedEmployees}
          supervisor={supervisor}
          onSupervisorChange={setSupervisor}
          caption="Choose a supervisor from selected employees"
        />
        </Box>
        <Box sx={{ flex: '0 0 50%'}}>
          <StaffSelector
          selectedEmployees={selectedEmployees}
          availableEmployees={filteredEmployees}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEmployeeToggle={handleEmployeeToggle}
          onRemoveEmployee={handleRemoveEmployee}
          title="Add more employees"
        />
        </Box>
        
      </Box>
      <Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
      <Box // this box should be fixed at the bottom
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
        <BaseBtn onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </BaseBtn>
      </Box>
    </PopupLayout>
  );
}
