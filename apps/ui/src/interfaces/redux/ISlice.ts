import { IMyTimesheetTableEntry,IMyTimesheetCalendarEntry } from "../layout";
import { IAccountTableRow } from "../component/organism/ITable";

export interface ITimesheetState {
  myTimesheetData: IMyTimesheetTableEntry[];
  myCalendarViewData: IMyTimesheetCalendarEntry[];
  currentWeekStart: string; // ISO string of the week's start date (Sunday)
  loading: boolean;
  error: string | null;
}

 export interface IAccountState{
  accountData: IAccountTableRow[];
 }