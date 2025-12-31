import React from 'react';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';
import DataTable from '../../templates/other/DataTable';
import { Box, Typography, CircularProgress } from '@mui/material';

interface IHistoryEntry {
  id: string;
  date: string;
  time: string;
  performedBy: string;
  performedByEmail: string;
  description: string;
  isFirstInGroup?: boolean;
}

interface IHistoryTableProps {
  rows: IHistoryEntry[];
  isLoading?: boolean;
}

const HistoryTable = ({ rows, isLoading = false }: IHistoryTableProps) => {
  // Group data by date and mark first entry in each group
  const processedRows = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    
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
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {row.performedBy}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.performedByEmail}
            </Typography>
          </Box>
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

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (processedRows.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No history entries found
        </Typography>
      </Box>
    );
  }

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
