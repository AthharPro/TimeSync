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
  enableHover?: boolean;
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

export interface IMyTimesheetCalendarEntry {
  id: string; 
  project: string;
  task: string;
  billableType: BillableType;
  myTimesheetEntriesIds: string[];
}

export interface IProjectTaskGroup {
  id: string;
  project: string;
  tasks: IMyTimesheetCalendarEntry[];
  isProjectRow: boolean;
}

export interface ITimesheetRow {
  id: string;
  project?: string;
  task?: string;
  billableType?: BillableType;
  myTimesheetEntriesIds?: string[];
  isProjectRow: boolean;
  isCreateTaskRow?: boolean;
}

