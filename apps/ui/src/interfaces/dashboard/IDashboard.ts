export interface IStatCard {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

export interface IProjectProgress {
  id: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
}

export interface IRecentActivity {
  id: string;
  user: string;
  action: string;
  project: string;
  timestamp: Date;
  avatar?: string;
}

export interface ITeamMemberStatus {
  id: string;
  name: string;
  avatar?: string;
  status: 'Available' | 'Busy' | 'Away';
  currentTask?: string;
  hoursLogged: number;
}

export interface ICalendarEvent {
  date: Date;
  title: string;
  type: 'deadline' | 'meeting' | 'holiday' | 'milestone';
}

export interface IHoursChartData {
  day: string;
  hours: number;
}

export interface ITimesheetSubmissionData {
  day: string;
  submissions: number; // number of users who submitted timesheets
}

export interface ITimesheetSubmission {
  status: string;
  count: number;
  color: string;
  [key: string]: any; // Index signature for recharts compatibility
}
