import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DataTable from '../../templates/other/DataTable';
import { useTheme } from '@mui/material/styles';
import {
  ReportPreviewTableProps,
} from '../../../interfaces/report/IReportPreview';
import { DataTableColumn } from '../../../interfaces/layout/ITableProps';

const ReportPreviewTable = <T extends { weekStartDate?: string; date?: string } = any>({
  columns,
  rows,
  title,
  subtitle,
  subtitle2,
  getRowKey,
}: ReportPreviewTableProps<T>) => {
  type RowWithEnd = T & { weekEndDate?: string };
  
  const getWeekEndDate = (weekStartDate: string) => {
    try {
      const start = new Date(weekStartDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 4); // Friday (Mon + 4 days) for working week
      return end.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  // Check if this is detailed timesheet (has weekStartDate) or entries (has date)
  const hasWeekStart = rows.some((row) => row.weekStartDate);
  const hasDate = rows.some((row) => (row as any).date);

  const enrichedRows: RowWithEnd[] = useMemo(
    () =>
      hasWeekStart
        ? rows.map((row) => ({
            ...(row as T),
            // Use weekEndDate from row if available, otherwise calculate it
            weekEndDate: (row as any).weekEndDate || (row.weekStartDate ? getWeekEndDate(row.weekStartDate) : ''),
          }))
        : rows.map((row) => row as RowWithEnd),
    [rows, hasWeekStart]
  );

  // Sort by weekStartDate for detailed timesheet, by date for entries
  const sortedRows: RowWithEnd[] = useMemo(
    () =>
      [...enrichedRows].sort((a, b) => {
        if (hasWeekStart && a.weekStartDate && b.weekStartDate) {
          const aTime = new Date(a.weekStartDate).getTime();
          const bTime = new Date(b.weekStartDate).getTime();
          return aTime - bTime;
        } else if (hasDate) {
          const aDate = (a as any).date;
          const bDate = (b as any).date;
          if (!aDate || !bDate) return 0;
          const aTime = new Date(aDate).getTime();
          const bTime = new Date(bDate).getTime();
          return aTime - bTime;
        }
        return 0;
      }),
    [enrichedRows, hasWeekStart, hasDate]
  );

  // Normalize columns - no need to add weekEndDate since backend provides it
  const normalizedBaseColumns: DataTableColumn<RowWithEnd>[] = useMemo(
    () =>
      columns.map((col) => {
        const label =
          (col as any).label ?? (col as any).header ?? (col as any).key;
        const renderFn =
          (col as any).render ??
          ((row: any) => (row ?? {})[(col as any).key] ?? '');
        return {
          key: (col as any).key,
          label,
          render: (row: RowWithEnd) => renderFn(row),
          width: (col as any).width,
        } as DataTableColumn<RowWithEnd>;
      }),
    [columns]
  );

  // Use normalized columns directly - backend already provides weekEndDate in data
  const enrichedColumns: DataTableColumn<RowWithEnd>[] = normalizedBaseColumns;
  const theme = useTheme();
  
  // For detailed timesheet sub-tables
  if (title && (title.startsWith('Project:') || title.startsWith('Team:') || title === 'Leave')) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
          {title}
        </Typography>
        {rows.length === 0 ? (
          <Box sx={{ py: 2 }}>
            <Typography sx={{ color: theme.palette.text.secondary}}>
              No data for current filters
            </Typography>
          </Box>
        ) : (
          <DataTable<RowWithEnd>
            columns={enrichedColumns}
            rows={sortedRows}
            getRowKey={
              (getRowKey as (row: RowWithEnd) => string | number) ||
              ((_: RowWithEnd, idx: number) => idx)
            }
          />
        )}
      </Box>
    );
  }

  // For main preview tables
  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
          {subtitle}
        </Typography>
      )}
      {subtitle2 && (
        <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
          {subtitle2}
        </Typography>
      )}
      {rows.length === 0 ? (
        <Box sx={{ py: 2 }}>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            No data for current filters
          </Typography>
        </Box>
      ) : (
        <DataTable<RowWithEnd>
          columns={enrichedColumns}
          rows={sortedRows}
          getRowKey={
            (getRowKey as (row: RowWithEnd) => string | number) ||
            ((_: RowWithEnd, idx: number) => idx)
          }
        />
      )}
    </Box>
  );
};

export default ReportPreviewTable;
