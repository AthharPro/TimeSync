import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Checkbox,
  CircularProgress,
  Typography,
} from '@mui/material';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import { BaseTextField } from '../../atoms';
import HoursField from '../../atoms/other/inputField/HoursField';
import Dropdown from '../../atoms/other/inputField/Dropdown';
import AutocompleteWithCreate from '../../atoms/other/inputField/AutocompleteWithCreate';
import { useReviewTimesheet } from '../../../hooks/timesheet';

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

interface EmpTimesheetTableProps {
  employeeId: string;
  onSelectedTimesheetsChange?: (timesheetIds: string[]) => void;
}

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

const EmpTimesheetTable: React.FC<EmpTimesheetTableProps> = ({ employeeId, onSelectedTimesheetsChange }) => {
  const {
    loadEmployeeTimesheets,
    getEmployeeTimesheets,
    isEmployeeTimesheetsLoading,
    getEmployeeTimesheetsError,
  } = useReviewTimesheet();

  // State to manage timesheet data
  const [timesheetData, setTimesheetData] = useState<IEmpTimesheetEntry[]>([]);

  // Get data from Redux store
  const timesheets = getEmployeeTimesheets(employeeId);
  const loading = isEmployeeTimesheetsLoading(employeeId);
  const error = getEmployeeTimesheetsError(employeeId);

  // Fetch timesheet data when component mounts or employeeId changes
  useEffect(() => {
    loadEmployeeTimesheets(employeeId);
  }, [employeeId, loadEmployeeTimesheets]);

  // Update local state when Redux data changes
  useEffect(() => {
    if (timesheets) {
      const transformedData: IEmpTimesheetEntry[] = timesheets.map((ts: any) => ({
        id: ts.id,
        date: ts.date,
        project: ts.project,
        task: ts.task,
        description: ts.description,
        hours: ts.hours,
        billableType: ts.billableType as BillableType,
        status: ts.status as DailyTimesheetStatus,
        isChecked: false,
      }));
      setTimesheetData(transformedData);
    }
  }, [timesheets]);

  // Notify parent of selected timesheets when selection changes
  useEffect(() => {
    if (onSelectedTimesheetsChange) {
      const selectedIds = timesheetData
        .filter(entry => entry.isChecked && entry.status === DailyTimesheetStatus.Pending)
        .map(entry => entry.id);
      onSelectedTimesheetsChange(selectedIds);
    }
  }, [timesheetData, onSelectedTimesheetsChange]);

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, isChecked: !entry.isChecked } : entry))
    );
  };

  // Handle select all checkbox
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    // Only select Pending timesheets
    setTimesheetData((prev) =>
      prev.map((entry) => ({
        ...entry,
        isChecked: entry.status === DailyTimesheetStatus.Pending ? checked : entry.isChecked,
      }))
    );
  };

  // Check if all Pending entries are selected
  const pendingTimesheets = timesheetData.filter(entry => entry.status === DailyTimesheetStatus.Pending);
  const isAllSelected = pendingTimesheets.length > 0 && pendingTimesheets.every((entry) => entry.isChecked);
  const isIndeterminate = pendingTimesheets.some((entry) => entry.isChecked) && !isAllSelected;

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

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Show empty state
  if (timesheetData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="text.secondary">
          No timesheets found for this employee.
        </Typography>
      </Box>
    );
  }

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
                    disabled={entry.status !== DailyTimesheetStatus.Pending}
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
