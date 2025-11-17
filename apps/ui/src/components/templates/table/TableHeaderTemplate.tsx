import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { ITableHeaderProps } from '../../../interfaces/table/ITable';

function TableHeaderTemplate<T>({ columns }: ITableHeaderProps<T>) {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || 'left'}
            style={{ minWidth: column.minWidth }}
            sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeaderTemplate;
