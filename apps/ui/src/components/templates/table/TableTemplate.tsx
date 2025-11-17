import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { ITableProps } from '../../../interfaces/table/ITable';
import TableHeaderTemplate from './TableHeaderTemplate';
import TableRowTemplate from './TableRowTemplate';

function TableTemplate<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  keyExtractor,
}: ITableProps<T>) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Paper elevation={2}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table stickyHeader>
        <TableHeaderTemplate columns={columns} />
        <TableBody>
          {data.map((row) => (
            <TableRowTemplate
              key={keyExtractor(row)}
              row={row}
              columns={columns}
              onClick={onRowClick}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableTemplate;
