
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import {  DataTableProps } from '../../../interfaces';

function DataTable<T>({ columns, rows, getRowKey, onRowClick, enableHover = false }: DataTableProps<T>) {
  return (
    <TableContainer>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col, index) => (
              <TableCell 
                key={col.key} 
                sx={{ 
                  width: col.width || 'auto', 
                  backgroundColor: '#f5f5f5',
                  color: 'theme.palette.text.primary',
                  borderRight: index < columns.length - 1 ? '1px dotted #edededff' : 'none'
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
              <TableRow 
                key={rowKeyString} 
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
                      borderRight: colIndex < columns.length - 1 ? '1px dotted #edededff' : 'none'
                    }}
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;