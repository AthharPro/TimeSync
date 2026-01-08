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
import { ReviewTimesheetFilters } from '../popover/ReviewTimesheetFilterPopover';

// Interface for employee data
interface IEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
  pendingTimesheetCount?: number;
}

interface ReviewTimesheetTableProps {
  onSelectedTimesheetsChange?: (employeeId: string, timesheetIds: string[]) => void;
  filters?: ReviewTimesheetFilters;
  supervisedProjectIds?: string[];
  supervisedTeamIds?: string[];
  nonDeptTeamEmployeeIds?: string[];
  initialEmployeeId?: string | null;
}

const ReviewTimesheetTable: React.FC<ReviewTimesheetTableProps> = ({ 
  onSelectedTimesheetsChange,
  filters,
  supervisedProjectIds = [],
  supervisedTeamIds = [],
  nonDeptTeamEmployeeIds = [],
  initialEmployeeId = null
}) => {
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

  // Auto-open drawer for initial employee ID (from notification)
  useEffect(() => {
    if (initialEmployeeId && employees.length > 0) {
      // Check if the employee exists in the list
      const employeeExists = employees.some(emp => emp.id === initialEmployeeId);
      if (employeeExists) {
        setExpandedEmployees(new Set([initialEmployeeId]));
      }
    }
  }, [initialEmployeeId, employees]);

  // Handle timesheet selection change from child component
  const handleTimesheetSelectionChange = (employeeId: string, timesheetIds: string[]) => {
    setSelectedTimesheetsPerEmployee((prev) => {
      const newMap = new Map(prev);
      if (timesheetIds.length === 0) {
        newMap.delete(employeeId);
      } else {
        newMap.set(employeeId, timesheetIds);
      }
      
      // Notify parent component - use the updated map instead of state
      if (onSelectedTimesheetsChange) {
        if (timesheetIds.length > 0) {
          onSelectedTimesheetsChange(employeeId, timesheetIds);
        } else {
          // Check if there are any other employees with selections in the new map
          if (newMap.size > 0) {
            const [firstEmployeeId, firstTimesheetIds] = Array.from(newMap.entries())[0];
            onSelectedTimesheetsChange(firstEmployeeId, firstTimesheetIds);
          } else {
            onSelectedTimesheetsChange('', []);
          }
        }
      }
      
      return newMap;
    });
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
      render: (row) => <Box sx={{ py: 0.5 }}>{row.employeeId}</Box>,
      width: '15%',
    },
    {
      label: 'Employee',
      key: 'employee',
      render: (row) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" fontWeight={500}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        </Box>
      ),
      width: '30%',
    },
    {
      label: 'Designation',
      key: 'designation',
      render: (row) => <Box sx={{ py: 0.5 }}>{row.designation || 'N/A'}</Box>,
      width: '20%',
    },
    {
      label: 'Pending Timesheets',
      key: 'pendingTimesheetCount',
      render: (row) => (
        <Box sx={{ py: 0.5 }}>
          {row.pendingTimesheetCount !== undefined ? row.pendingTimesheetCount : 0}
        </Box>
      ),
      width: '15%',
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

  // Filter employees based on filterEmployees option
  const filteredEmployees = employees.filter((employee) => {
    if (!filters?.filterEmployees || filters.filterEmployees === 'all') {
      return true; // Show all employees
    }
    
    const pendingCount = employee.pendingTimesheetCount || 0;
    
    if (filters.filterEmployees === 'withPending') {
      return pendingCount > 0; // Only employees with pending timesheets
    }
    
    if (filters.filterEmployees === 'noPending') {
      return pendingCount === 0; // Only employees without pending timesheets
    }
    
    return true;
  });

  // Show empty state if no employees match the filter
  if (filteredEmployees.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="text.secondary">
          No employees found matching the selected filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable<IEmployee>
        columns={columns}
        rows={filteredEmployees}
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
                        filters={filters}
                        supervisedProjectIds={supervisedProjectIds}
                        supervisedTeamIds={supervisedTeamIds}
                        nonDeptTeamEmployeeIds={nonDeptTeamEmployeeIds}
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
