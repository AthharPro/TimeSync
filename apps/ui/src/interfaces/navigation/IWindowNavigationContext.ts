import { ReactNode } from 'react';

export interface ReviewTimesheetNavParams {
  employeeId?: string;
  month?: string;
  status?: string;
}

export interface MyTimesheetNavParams {
  year?: string;
  month?: string;
  status?: string;
}

export interface IWindowNavigationContext {
  selectedButton: string | null;
  setSelectedButton: (button: string | null) => void;
  reviewTimesheetParams: ReviewTimesheetNavParams | null;
  setReviewTimesheetParams: (params: ReviewTimesheetNavParams | null) => void;
  myTimesheetParams: MyTimesheetNavParams | null;
  setMyTimesheetParams: (params: MyTimesheetNavParams | null) => void;
}

export interface IWindowNavigationProviderProps {
  children: ReactNode;
}
