import React, { useState, useEffect, useMemo } from 'react';
import PopupLayout from '../../templates/popup/PopUpLayout';
import EmployeePicker from '../../molecules/common/EmployeePicker';
import { IEmployee } from '../../../interfaces/user/IUser';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { AddEmployeePopupProps } from '../../../interfaces/popup/IPopupProps';
import { getUsers } from '../../../api/user';

const AddEmployeePopup: React.FC<AddEmployeePopupProps> = ({
  open,
  onClose,
  onSave,
  initialSelectedEmployees = [],
  roles = [],
}) => {
  const [allEmployees, setAllEmployees] = useState<IEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>(
    initialSelectedEmployees
  );
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roleFilters = useMemo(() => roles || [], [roles]);

  // Normalize backend user shape into the frontend IEmployee shape
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

  // Fetch users when dialog opens or role filter changes
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await getUsers(roleFilters);
        if (!isMounted) return;
        const mappedEmployees = users.map(mapUserToEmployee);
        setAllEmployees(mappedEmployees);
      } catch (err: any) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load employees'
        );
        setAllEmployees([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [open, roleFilters]);

  // Apply search filtering whenever data or search term changes
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = allEmployees.filter((employee) =>
      [
        employee.name,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.designation,
      ]
        .filter(Boolean)
        .some((field) => field?.toString().toLowerCase().includes(term))
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, allEmployees]);

  useEffect(() => {
    if (open) {
      setSelectedEmployees(initialSelectedEmployees);
      setSearchTerm('');
    }
  }, [open, initialSelectedEmployees]);

  const handleEmployeeToggle = (employee: IEmployee) => {
    const isSelected = selectedEmployees.find((emp) => emp._id === employee._id);

    if (isSelected) {
      setSelectedEmployees(
        selectedEmployees.filter((emp) => emp._id !== employee._id)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(
      selectedEmployees.filter((emp) => emp._id !== employeeId)
    );
  };

  const handleCancel = () => {
    setSelectedEmployees(initialSelectedEmployees);
    setSearchTerm('');
    onClose();
  };

  return (
    <PopupLayout
      open={open}
      onClose={handleCancel}
      onBack={handleCancel}
      title="Build Your Team"
      subtitle="Search and select employees to add to your Team"
      maxWidth="lg"
      paperHeight={'625px'}
    >
      <Box>
        {isLoading && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Loading employees...
          </Typography>
        )}
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        <EmployeePicker
          users={filteredEmployees}
          selected={selectedEmployees}
          onToggle={handleEmployeeToggle}
          onRemove={handleRemoveEmployee}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
          mt: 2,
        }}
      >
        <BaseBtn onClick={handleCancel} variant="outlined">
          Cancel
        </BaseBtn>
        <BaseBtn
          onClick={() => {
            onSave(selectedEmployees);
            onClose();
          }}
          variant="contained"
          disabled={selectedEmployees.length === 0}
        >
          {selectedEmployees.length === 0
            ? 'No Employees Selected'
            : `Add ${selectedEmployees.length} Employee${
                selectedEmployees.length !== 1 ? 's' : ''
              }`}
        </BaseBtn>
      </Box>
    </PopupLayout>
  );
};

export default AddEmployeePopup;
