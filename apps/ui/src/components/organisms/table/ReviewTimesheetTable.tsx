import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TableRow,
  TableCell,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmpTimesheetTable from './EmpTimesheetTable';
import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';

// Interface for employee data
interface IEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
}

// Dummy data for employees
const dummyEmployees: IEmployee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@timesync.com',
    designation: 'Senior Developer',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@timesync.com',
    designation: 'Project Manager',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Michael Johnson',
    email: 'michael.johnson@timesync.com',
    designation: 'UI/UX Designer',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Emily Davis',
    email: 'emily.davis@timesync.com',
    designation: 'QA Engineer',
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Sarah Brown',
    email: 'sarah.brown@timesync.com',
    designation: 'Frontend Developer',
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'David Martinez',
    email: 'david.martinez@timesync.com',
    designation: 'DevOps Engineer',
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@timesync.com',
    designation: 'Business Analyst',
  },
];

const ReviewTimesheetTable = () => {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

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
      label: 'Name',
      key: 'name',
      render: (row) => <Box sx={{ py: 0.5 }}>{row.name}</Box>,
      width: '20%',
    },
    {
      label: 'Email',
      key: 'email',
      render: (row) => <Box sx={{ py: 0.5 }}>{row.email}</Box>,
      width: '30%',
    },
    {
      label: 'Designation',
      key: 'designation',
      render: (row) => <Box sx={{ py: 0.5 }}>{row.designation}</Box>,
      width: '35%',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable<IEmployee>
        columns={columns}
        rows={dummyEmployees}
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
                  backgroundColor: 'background.default',
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
                      <EmpTimesheetTable />
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
