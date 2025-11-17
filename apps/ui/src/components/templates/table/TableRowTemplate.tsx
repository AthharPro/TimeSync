import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import { ITableRowProps } from '../../../interfaces/table/ITable';

function TableRowTemplate<T>({ row, columns, onClick }: ITableRowProps<T>) {
  return (
    <TableRow
      hover
      onClick={() => onClick?.(row)}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {columns.map((column) => (
        <TableCell key={column.id} align={column.align || 'left'}>
          {column.render ? column.render(row) : null}
        </TableCell>
      ))}
    </TableRow>
  );
}

export default TableRowTemplate;
