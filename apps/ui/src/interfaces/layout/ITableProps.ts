import { BillableType, DailyTimesheetStatus } from "@tms/shared";

export interface DataTableColumn<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  key: string;
  width?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

export interface IMyTimesheetTableEntry {
  id: string; 
  date: string; 
  project: string;
  task: string;
  description: string;
  hours: number;
  billableType: BillableType;
  status: DailyTimesheetStatus;
  isChecked?: boolean;
}

export interface IAccountTableEntry {
  id: string;
  name: string;
  email: string;
  role?: string;
  contactNumber?: string;
  createdOn?: string;
  status: 'Active' | 'Inactive' | boolean;
  action: React.ReactNode;
}
