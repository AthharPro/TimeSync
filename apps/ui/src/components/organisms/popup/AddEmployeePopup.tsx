import React, { useState, useEffect } from 'react';
import PopupLayout from '../../templates/popup/PopUpLayout';
import EmployeePicker from '../../molecules/common/EmployeePicker';
import { IEmployee } from '../../../interfaces/user/IUser';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import { AddEmployeePopupProps } from '../../../interfaces/popup/IPopupProps';

const AddEmployeePopup: React.FC<AddEmployeePopupProps> = ({
  open,
  onClose,
  onSave,
  initialSelectedEmployees = [],
  roles = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>(
    initialSelectedEmployees
  );
  
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployee[]>(
    []
  );

  useEffect(() => {
    // TODO: Fetch users by roles from API
    // For now, using empty array until the hook is implemented
    const users: IEmployee[] = [];
    const filtered = users.filter((employee) =>
      [employee.firstName, employee.lastName, employee.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [searchTerm]);

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
      maxWidth="xs"
      paperHeight="75vh"
    >
      <Box sx={{ p: 1 }}>
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
