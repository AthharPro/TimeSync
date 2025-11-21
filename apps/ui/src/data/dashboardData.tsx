import { IStatCard, IProjectProgress, IRecentActivity, ITeamMemberStatus, ITimesheetSubmission } from '../interfaces/dashboard/IDashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const dashboardStats: IStatCard[] = [
  {
    title: 'Active Projects',
    value: 12,
    change: 8.5,
    changeLabel: 'vs last month',
    icon: <AssignmentIcon />,
    color: 'primary',
  },
  {
    title: 'Team Members',
    value: 48,
    change: 12.3,
    changeLabel: 'new this month',
    icon: <PeopleIcon />,
    color: 'info',
  },
  {
    title: 'Hours This Week',
    value: '324',
    change: 5.8,
    changeLabel: 'vs last week',
    icon: <AccessTimeIcon />,
    color: 'warning',
  },
  {
    title: 'Tasks Completed This Month',
    value: 156,
    change: 23.4,
    changeLabel: 'this month',
    icon: <CheckCircleIcon />,
    color: 'success',
  },
];

export const calendarEvents = [
  {
    date: new Date(2025, 10, 25), // Nov 25, 2025
    title: 'Project Deadline',
    type: 'deadline' as const,
  },
  {
    date: new Date(2025, 10, 22), // Nov 22, 2025
    title: 'Team Meeting',
    type: 'meeting' as const,
  },
  {
    date: new Date(2025, 10, 28), // Nov 28, 2025
    title: 'Thanksgiving Holiday',
    type: 'holiday' as const,
  },
  {
    date: new Date(2025, 10, 30), // Nov 30, 2025
    title: 'Sprint Milestone',
    type: 'milestone' as const,
  },
  {
    date: new Date(2025, 11, 5), // Dec 5, 2025
    title: 'Client Review',
    type: 'meeting' as const,
  },
];

export const weeklyHoursData = [
  { day: 'Mon', hours: 8 },
  { day: 'Tue', hours: 7.5 },
  { day: 'Wed', hours: 8 },
  { day: 'Thu', hours: 6 },
  { day: 'Fri', hours: 7 },
  { day: 'Sat', hours: 3 },
  { day: 'Sun', hours: 1 },
];

export const projectProgress: IProjectProgress[] = [
  {
    id: '1',
    projectName: 'E-Commerce Platform Redesign',
    progress: 75,
    daysLeft: 15,
    status: 'On Track',
  },
  {
    id: '2',
    projectName: 'Mobile Banking App',
    progress: 45,
    daysLeft: 8,
    status: 'At Risk',
  },
  {
    id: '3',
    projectName: 'AI Analytics Dashboard',
    progress: 90,
    daysLeft: 5,
    status: 'On Track',
  },
  {
    id: '4',
    projectName: 'CRM System Integration',
    progress: 30,
    daysLeft: 2,
    status: 'Delayed',
  },
  {
    id: '5',
    projectName: 'Healthcare Portal',
    progress: 60,
    daysLeft: 20,
    status: 'On Track',
  },
];

export const recentActivities: IRecentActivity[] = [
  {
    id: '1',
    user: 'John Smith',
    action: 'logged 8 hours on',
    project: 'E-Commerce Platform',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  },
  {
    id: '2',
    user: 'Sarah Connor',
    action: 'updated status of',
    project: 'Mobile Banking App',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '3',
    user: 'Michael Chen',
    action: 'completed task in',
    project: 'AI Analytics Dashboard',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: '4',
    user: 'Priya Patel',
    action: 'added new milestone to',
    project: 'CRM System Integration',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: '5',
    user: 'Robert Johnson',
    action: 'started work on',
    project: 'Healthcare Portal',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
];

export const teamStatus: ITeamMemberStatus[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    status: 'Busy',
    currentTask: 'Frontend Development',
    hoursLogged: 6.5,
  },
  {
    id: '2',
    name: 'Bob Williams',
    status: 'Available',
    currentTask: undefined,
    hoursLogged: 8,
  },
  {
    id: '3',
    name: 'Carol Davis',
    status: 'Busy',
    currentTask: 'UI/UX Design',
    hoursLogged: 5,
  },
  {
    id: '4',
    name: 'David Brown',
    status: 'Away',
    currentTask: undefined,
    hoursLogged: 4,
  },
  {
    id: '5',
    name: 'Emma Wilson',
    status: 'Busy',
    currentTask: 'iOS Development',
    hoursLogged: 7,
  },
];

export const timesheetSubmissions: ITimesheetSubmission[] = [
  { team: 'Development', submitted: 85, color: '#1976d2' },
  { team: 'HR', submitted: 92, color: '#2e7d32' },
  { team: 'Finance', submitted: 78, color: '#ed6c02' },
];
