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