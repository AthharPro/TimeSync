import { BillableType } from "@tms/shared";
import { ITimesheetRow } from "../../layout";

export interface ITimesheetTableEntry {
  id: string; 
  date: Date; 
  project?: string;
  team?: string;
  task: string;
  description: string;
  hours: number;
  billableType: BillableType;
  status: string;
  isChecked?: boolean; 
}

export interface TimesheetCellProps {
  hours: number;
  description?: string;
  isTodayColumn?: boolean;
  onHoursChange: (value: number) => void;
  onDescriptionChange?: (value: string) => void;
  date?: Date;
  row?: ITimesheetRow;
  disabled?: boolean;
  status?: string;
}

export interface CreateTaskRowProps {
  onCreateTask: () => void;
}

export interface TaskRowProps {
  task: string;
  billableType: BillableType;
  rowId: string;
  projectId?: string;
  availableTasks: string[];
  onTaskChange: (rowId: string, newTask: string | null) => void;
  onBillableTypeChange: (rowId: string, billableType: BillableType) => void;
  onCreateNewTask?: (projectId: string, taskName: string) => Promise<any>;
}

export interface CustomRowProps {
  text: string;
}

export interface IAccountTableRow {
  id?: string;
  employee_id?: string;
  email: string;
  firstName: string;
  lastName: string;
  team?: string;
  status: 'Active' | 'Inactive' | string;
  contactNumber: string;
  designation?: string;
  role?: string;
  createdAt?: string;
}

export interface IAccountTableProps {
  rows: IAccountTableRow[];
  onEditRow?: (row: IAccountTableRow) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (row: IAccountTableRow) => void;
  disableEdit?: boolean;
  showDelete?: boolean;
  disableDelete?: boolean;
  currentUserRole?: string;
}