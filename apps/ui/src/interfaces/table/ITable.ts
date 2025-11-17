import { ReactNode } from 'react';

export interface ITableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface ITableProps<T> {
  columns: ITableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export interface ITableHeaderProps<T = unknown> {
  columns: ITableColumn<T>[];
}

export interface ITableRowProps<T> {
  row: T;
  columns: ITableColumn<T>[];
  onClick?: (row: T) => void;
}
