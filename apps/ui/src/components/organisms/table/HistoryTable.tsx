import React from 'react';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import DataTable from '../../templates/other/DataTable';
import { Box, Typography } from '@mui/material';

interface IHistoryEntry {
  id: string;
  date: string;
  time: string;
  performedBy: string;
  description: string;
  isFirstInGroup?: boolean;
}

interface IHistoryTableProps {
  rows?: IHistoryEntry[];
}

// Dummy data with same dates grouped together
const dummyHistoryData: IHistoryEntry[] = [
  {
    id: '1',
    date: '2025-12-15',
    time: '09:30 AM',
    performedBy: 'John Doe',
    description: 'Created new project "Website Redesign"',
  },
  {
    id: '2',
    date: '2025-12-15',
    time: '10:15 AM',
    performedBy: 'Jane Smith',
    description: 'Updated task status from "In Progress" to "Completed"',
  },
  {
    id: '3',
    date: '2025-12-15',
    time: '02:45 PM',
    performedBy: 'John Doe',
    description: 'Added new team member to project',
  },
  {
    id: '4',
    date: '2025-12-14',
    time: '11:20 AM',
    performedBy: 'Mike Johnson',
    description: 'Submitted timesheet for approval',
  },
  {
    id: '5',
    date: '2025-12-14',
    time: '03:30 PM',
    performedBy: 'Sarah Williams',
    description: 'Approved timesheet for Team Alpha',
  },
  {
    id: '6',
    date: '2025-12-14',
    time: '04:55 PM',
    performedBy: 'John Doe',
    description: 'Modified project deadline',
  },
  {
    id: '7',
    date: '2025-12-13',
    time: '09:00 AM',
    performedBy: 'Jane Smith',
    description: 'Started new sprint planning',
  },
  {
    id: '8',
    date: '2025-12-13',
    time: '01:15 PM',
    performedBy: 'Mike Johnson',
    description: 'Created task "Implement authentication"',
  },
  {
    id: '9',
    date: '2025-12-12',
    time: '10:30 AM',
    performedBy: 'Sarah Williams',
    description: 'Deleted obsolete project files',
  },
  {
    id: '10',
    date: '2025-12-12',
    time: '11:45 AM',
    performedBy: 'John Doe',
    description: 'Updated user permissions',
  },
];

const HistoryTable = ({ rows = dummyHistoryData }: IHistoryTableProps) => {
  // Group data by date and mark first entry in each group
  const processedRows = React.useMemo(() => {
    const sortedRows = [...rows].sort((a, b) => {
      // Sort by date descending (newest first), then by time
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    let lastDate = '';
    return sortedRows.map(row => {
      const isFirstInGroup = row.date !== lastDate;
      lastDate = row.date;
      return { ...row, isFirstInGroup };
    });
  }, [rows]);

  const columns: DataTableColumn<IHistoryEntry>[] = [
    {
      label: 'Date and Time',
      key: 'datetime',
      width: '20%',
      render: (row) => (
        <Box>
          {row.isFirstInGroup && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {new Date(row.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              pl: 2,
              fontSize: '0.875rem',
            }}
          >
            {row.time}
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Performed By',
      key: 'performedBy',
      width: '20%',
      render: (row) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end',
          minHeight: row.isFirstInGroup ? '52px' : 'auto',
        }}>
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {row.performedBy}
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Description',
      key: 'description',
      width: '60%',
      render: (row) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end',
          minHeight: row.isFirstInGroup ? '52px' : 'auto',
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.description}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={processedRows}
      getRowKey={(row) => row.id}
      size="medium"
    />
  );
};

export default HistoryTable;
export type { IHistoryEntry, IHistoryTableProps };
