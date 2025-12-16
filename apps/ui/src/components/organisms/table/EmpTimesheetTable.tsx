import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Checkbox,
} from '@mui/material';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import { BaseTextField } from '../../atoms';
import HoursField from '../../atoms/other/inputField/HoursField';
import Dropdown from '../../atoms/other/inputField/Dropdown';
import AutocompleteWithCreate from '../../atoms/other/inputField/AutocompleteWithCreate';

// Interface for employee timesheet entry
interface IEmpTimesheetEntry {
  id: string;
  date: string;
  project: string;
  task: string;
  description: string;
  hours: number;
  billableType: BillableType;
  status: DailyTimesheetStatus;
  isChecked?: boolean;
}

// Dummy data for employee timesheet
const dummyEmpTimesheet: IEmpTimesheetEntry[] = [
  {
    id: '1',
    date: '2025-12-09',
    project: 'TimeSync Development',
    task: 'Frontend Development',
    description: 'Implemented review timesheet table with expandable rows and inline editing functionality',
    hours: 8,
    billableType: BillableType.Billable,
    status: DailyTimesheetStatus.Pending,
    isChecked: false,
  },
  {
    id: '2',
    date: '2025-12-10',
    project: 'TimeSync Development',
    task: 'Backend API',
    description: 'Created timesheet endpoints for employee review and approval workflow',
    hours: 7.5,
    billableType: BillableType.Billable,
    status: DailyTimesheetStatus.Pending,
    isChecked: false,
  },
  {
    id: '3',
    date: '2025-12-11',
    project: 'Internal Meeting',
    task: 'Team Meeting',
    description: 'Sprint planning meeting and retrospective for current iteration',
    hours: 2,
    billableType: BillableType.NonBillable,
    status: DailyTimesheetStatus.Pending,
    isChecked: false,
  },
  {
    id: '4',
    date: '2025-12-12',
    project: 'TimeSync Development',
    task: 'Testing',
    description: 'Unit tests for timesheet module including API integration tests',
    hours: 6,
    billableType: BillableType.Billable,
    status: DailyTimesheetStatus.Pending,
    isChecked: false,
  },
  {
    id: '5',
    date: '2025-12-13',
    project: 'TimeSync Development',
    task: 'Documentation',
    description: 'API documentation update and inline code comments for better maintainability',
    hours: 4,
    billableType: BillableType.Billable,
    status: DailyTimesheetStatus.Pending,
    isChecked: false,
  },
];

// Dummy task options
const taskOptions = [
  'Frontend Development',
  'Backend API',
  'Team Meeting',
  'Testing',
  'Documentation',
  'Code Review',
  'Bug Fixing',
];

// Billable type options as Record
const billableTypeOptions: Record<string, BillableType> = {
  'Billable': BillableType.Billable,
  'Non-Billable': BillableType.NonBillable,
};

const EmpTimesheetTable: React.FC = () => {
  // State to manage timesheet data
  const [timesheetData, setTimesheetData] = useState<IEmpTimesheetEntry[]>(dummyEmpTimesheet);

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, isChecked: !entry.isChecked } : entry))
    );
  };

  // Handle select all checkbox
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setTimesheetData((prev) => prev.map((entry) => ({ ...entry, isChecked: checked })));
  };

  // Check if all entries are selected
  const isAllSelected = timesheetData.length > 0 && timesheetData.every((entry) => entry.isChecked);
  const isIndeterminate = timesheetData.some((entry) => entry.isChecked) && !isAllSelected;

  // Handle field changes
  const handleFieldChange = (id: string, field: keyof IEmpTimesheetEntry, value: string | number | BillableType) => {
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
    // TODO: Add API call to save changes
    console.log('Updated entry:', id, field, value);
  };

  // Handle task change
  const handleTaskChange = (id: string, value: string | null) => {
    if (value) {
      handleFieldChange(id, 'task', value);
    }
  };

  // Handle description change
  const handleDescriptionChange = (id: string, value: string) => {
    handleFieldChange(id, 'description', value);
  };

  // Handle hours change
  const handleHoursChange = (id: string, value: number) => {
    handleFieldChange(id, 'hours', value);
  };

  // Handle billable type change
  const handleBillableTypeChange = (id: string, value: string) => {
    handleFieldChange(id, 'billableType', value as BillableType);
  };

  return (
    <Box>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '50px' }} padding="checkbox">
                <Checkbox
                  size="small"
                  sx={{ paddingTop: 0, paddingBottom: 0 }}
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '110px' }}>
                Date
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '180px' }}>
                Project
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '200px' }}>
                Task
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>
                Description
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '100px' }} align="center">
                Hours
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '130px' }}>
                Type
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '100px' }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timesheetData.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={entry.isChecked || false}
                    onChange={() => handleCheckboxChange(entry.id)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>{entry.project}</TableCell>
                <TableCell>
                  <AutocompleteWithCreate
                    options={taskOptions}
                    value={entry.task}
                    onChange={(value) => handleTaskChange(entry.id, value)}
                    placeholder="Select or create task"
                  />
                </TableCell>
                <TableCell>
                  <BaseTextField
                    value={entry.description}
                    onChange={(e) => handleDescriptionChange(entry.id, e.target.value)}
                    placeholder="Enter description"
                    multiline
                    fullWidth
                    variant="standard"
                    sx={{
                      '& .MuiInput-underline:before': { borderBottom: 'none' },
                      '& .MuiInput-underline:after': { borderBottom: 'none' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                        borderBottom: 'none',
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <HoursField
                    value={entry.hours}
                    onChange={(value) => handleHoursChange(entry.id, value)}
                  />
                </TableCell>
                <TableCell>
                  <Dropdown
                    value={entry.billableType}
                    onChange={(value) => handleBillableTypeChange(entry.id, value)}
                    options={billableTypeOptions}
                  />
                </TableCell>
                <TableCell>{entry.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmpTimesheetTable;
