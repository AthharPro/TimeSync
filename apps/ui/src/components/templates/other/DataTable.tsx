
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import React from 'react';
import {  DataTableProps } from '../../../interfaces';

function DataTable<T>({ columns, rows, getRowKey, onRowClick, enableHover = false, renderExpandedRow, size = 'small' }: DataTableProps<T>) {
  return (
    <TableContainer>
      <Table size={size} stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col, index) => (
              <TableCell 
                key={col.key} 
                sx={{ 
                  width: col.width || 'auto', 
                  backgroundColor: '#f5f5f5',
                  color: 'theme.palette.text.primary',
                  borderRight: index < columns.length - 1 ? '1px dotted #edededff' : 'none',
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {col.renderHeader ? col.renderHeader() : col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => {
            const providedKey = getRowKey ? getRowKey(row) : undefined;
            const computedRowKey = providedKey ?? rowIndex;
            const rowKeyString = String(computedRowKey);
            
            return (
              <React.Fragment key={rowKeyString}>
                <TableRow 
                  hover={enableHover} 
                  onClick={onRowClick && enableHover ? () => onRowClick(row) : undefined} 
                  sx={{ 
                    cursor: onRowClick && enableHover ? 'pointer' : 'default',
                    backgroundColor: 'inherit'
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell 
                      key={`${col.key}-${rowKeyString}`} 
                      sx={{ 
                        width: col.width || 'auto',
                        borderRight: colIndex < columns.length - 1 ? '1px dotted #edededff' : 'none',
                        py: 0.75,
                      }}
                    >
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
                {renderExpandedRow && renderExpandedRow(row)}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;