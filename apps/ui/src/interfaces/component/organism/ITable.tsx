import { BillableType } from "@tms/shared";

export interface ITimesheetTableEntry {
  id: string; 
  date: Date; 
  project: string;
  task: string;
  description: string;
  hours: number;
  billableType: BillableType;
  status: string;
  isChecked?: boolean; 
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
  disableEdit?: boolean;
  showDelete?: boolean;
  disableDelete?: boolean;
}