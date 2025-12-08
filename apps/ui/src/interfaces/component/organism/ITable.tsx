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

export interface TimesheetCellProps {
  hours: number;
  description?: string;
  isTodayColumn?: boolean;
  onHoursChange: (value: number) => void;
  onDescriptionChange?: (value: string) => void;
  date?: Date;
  row?: any;
}

export interface CreateTaskRowProps {
  onCreateTask: () => void;
}

export interface TaskRowProps {
  task: string;
  billableType: BillableType;
  rowId: string;
  availableTasks: string[];
  onTaskChange: (rowId: string, newTask: string | null) => void;
  onBillableTypeChange: (rowId: string, billableType: BillableType) => void;
}

export interface CustomRowProps {
  text: string;
}