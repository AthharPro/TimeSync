
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import {  DataTableProps } from '../../../interfaces';

function DataTable<T>({ columns, rows, getRowKey, onRowClick }: DataTableProps<T>) {
  return (
    <TableContainer>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ width: col.width || 'auto', fontWeight: 'bold' }}>
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
              <TableRow key={rowKeyString} hover onClick={onRowClick ? () => onRowClick(row) : undefined} sx={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                {columns.map((col) => (
                  <TableCell key={`${col.key}-${rowKeyString}`} sx={{ width: col.width || 'auto' }}>{col.render(row)}</TableCell>
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