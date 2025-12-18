import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  TableRow,
  TableCell,
  Collapse,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmpTimesheetTable from './EmpTimesheetTable';
import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import { useReviewTimesheet } from '../../../hooks/timesheet';

// Interface for employee data
interface IEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
}

interface ReviewTimesheetTableProps {
  onSelectedTimesheetsChange?: (employeeId: string, timesheetIds: string[]) => void;
}

const ReviewTimesheetTable: React.FC<ReviewTimesheetTableProps> = ({ onSelectedTimesheetsChange }) => {
  const {
    employees,
    loading,
    error,
    loadSupervisedEmployees,
    loadEmployeeTimesheets,
  } = useReviewTimesheet();

  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [selectedTimesheetsPerEmployee, setSelectedTimesheetsPerEmployee] = useState<Map<string, string[]>>(new Map());

  // Fetch supervised employees on component mount
  useEffect(() => {
    loadSupervisedEmployees();
  }, [loadSupervisedEmployees]);

  // Handle timesheet selection change from child component
  const handleTimesheetSelectionChange = (employeeId: string, timesheetIds: string[]) => {
    setSelectedTimesheetsPerEmployee((prev) => {
      const newMap = new Map(prev);
      if (timesheetIds.length === 0) {
        newMap.delete(employeeId);
      } else {
        newMap.set(employeeId, timesheetIds);
      }
      return newMap;
    });

    // Notify parent component - find the first employee with selections
    if (onSelectedTimesheetsChange) {
      if (timesheetIds.length > 0) {
        onSelectedTimesheetsChange(employeeId, timesheetIds);
      } else {
        // Check if there are any other employees with selections
        const updatedMap = new Map(selectedTimesheetsPerEmployee);
        updatedMap.delete(employeeId);
        if (updatedMap.size > 0) {
          const [firstEmployeeId, firstTimesheetIds] = Array.from(updatedMap.entries())[0];
          onSelectedTimesheetsChange(firstEmployeeId, firstTimesheetIds);
        } else {
          onSelectedTimesheetsChange('', []);
        }
      }
    }
  };

  // Handle row click to toggle drawer for that employee
  const handleRowClick = (employee: IEmployee) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employee.id)) {
        newSet.delete(employee.id);
      } else {
        newSet.add(employee.id);
      }
      return newSet;
    });
  };

  // Handle drawer close for specific employee
  const handleDrawerClose = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      newSet.delete(employeeId);
      return newSet;
    });
  };

  // Define columns
  const columns: DataTableColumn<IEmployee>[] = [
    {
      label: 'Employee ID',
      key: 'employeeId',
      render: (row) => <Box sx={{ py: 1 }}>{row.employeeId}</Box>,
      width: '15%',
    },
    {
      label: 'Name',
      key: 'name',
      render: (row) => <Box sx={{ py: 1 }}>{row.name}</Box>,
      width: '20%',
    },
    {
      label: 'Email',
      key: 'email',
      render: (row) => <Box sx={{ py: 1 }}>{row.email}</Box>,
      width: '30%',
    },
    {
      label: 'Designation',
      key: 'designation',
      render: (row) => <Box sx={{ py: 1 }}>{row.designation || 'N/A'}</Box>,
      width: '35%',
    },
  ];

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
  if (employees.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="text.secondary">
          No employees found. You are not supervising any projects or teams.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable<IEmployee>
        columns={columns}
        rows={employees}
        getRowKey={(row) => row.id}
        onRowClick={handleRowClick}
        enableHover={true}
        size="small"
        renderExpandedRow={(employee) =>
          expandedEmployees.has(employee.id) ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{
                  p: 0,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Collapse in={expandedEmployees.has(employee.id)} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2 }}>
                    {/* Drawer Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        mb: 0,
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDrawerClose(employee.id);
                        }}
                        sx={{ color: 'text.secondary' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* Timesheet Content */}
                    <Box sx={{ mt: 0 }}>
                      <EmpTimesheetTable 
                        employeeId={employee.id}
                        onSelectedTimesheetsChange={(timesheetIds) => 
                          handleTimesheetSelectionChange(employee.id, timesheetIds)
                        }
                      />
                    </Box>
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          ) : null
        }
      />
    </Box>
  );
};

export default ReviewTimesheetTable;
