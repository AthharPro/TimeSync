import { ReactNode } from 'react';

export interface ReviewTimesheetNavParams {
  employeeId?: string;
  month?: string;
  status?: string;
  tab?: 'review' | 'editRequest'; // Add tab parameter to specify which tab to open
  editRequestStatus?: 'All' | 'Pending' | 'Approved' | 'Rejected'; // Add edit request status filter
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
