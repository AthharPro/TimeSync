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
  progress: number; // 0-100
  daysLeft: number;
  status: 'On Track' | 'At Risk' | 'Delayed';
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

export interface ITimesheetSubmission {
  team: string;
  submitted: number; // percentage 0-100
  color: string;
  [key: string]: any; // Index signature for recharts compatibility
}
