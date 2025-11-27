import { IStatCard, IProjectProgress, IRecentActivity, ITeamMemberStatus, ITimesheetSubmission, ITimesheetSubmissionData } from '../interfaces/dashboard/IDashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const dashboardStats: IStatCard[] = [
  {
    title: 'Active Projects',
    value: 12,
    change: 20,
    changeLabel: 'Total Projects',
    icon: <AssignmentIcon />,
    color: 'primary',
  },
  {
    title: 'Super Admins',
    value: 3,
    change: 12,
    changeLabel: 'Admin Users',
    icon: <PeopleIcon />,
    color: 'info',
  },
  {
    title: 'Users Not Submitted Timesheets',
    value: '24',
    change: 108,
    changeLabel: 'Users Submitted Timesheets',
    icon: <AccessTimeIcon />,
    color: 'warning',
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
  { day: 'Sun', hours: 1 },
  { day: 'Mon', hours: 8 },
  { day: 'Tue', hours: 7.5 },
  { day: 'Wed', hours: 8 },
  { day: 'Thu', hours: 6 },
  { day: 'Fri', hours: 7 },
  { day: 'Sat', hours: 3 },
  
];

export const weeklyTimesheetSubmissions: ITimesheetSubmissionData[] = [
  { day: 'Sun', submissions: 8 },
  { day: 'Mon', submissions: 42 },
  { day: 'Tue', submissions: 38 },
  { day: 'Wed', submissions: 45 },
  { day: 'Thu', submissions: 41 },
  { day: 'Fri', submissions: 39 },
  { day: 'Sat', submissions: 12 },
];

export const projectProgress: IProjectProgress[] = [
  {
    id: '1',
    projectName: 'E-Commerce Platform Redesign',
    startDate: new Date(2024, 10, 1), // Nov 1, 2024
    endDate: new Date(2025, 11, 15), // Dec 15, 2024
  },
  {
    id: '2',
    projectName: 'Mobile Banking App',
    startDate: new Date(2024, 10, 20), // Nov 20, 2024
    endDate: new Date(2026, 11, 25), // Dec 25, 2024
  },
  {
    id: '3',
    projectName: 'AI Analytics Dashboard',
    startDate: new Date(2024, 10, 15), // Nov 15, 2024
    endDate: new Date(2024, 11, 10), // Dec 10, 2024
  },
  {
    id: '4',
    projectName: 'CRM System Integration',
    startDate: new Date(2024, 10, 25), // Nov 25, 2024
    endDate: new Date(2025, 12, 5), // Jan 5, 2025
  },
  {
    id: '5',
    projectName: 'Healthcare Portal',
    startDate: new Date(2024, 10, 10), // Nov 10, 2024
    endDate: new Date(2026, 11, 30), // Dec 30, 2024
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
  { status: 'Submitted', count: 125, color: '#1976d2' },
  { status: 'Pending', count: 45, color: '#ed6c02' },
  { status: 'Approved', count: 98, color: '#2e7d32' },
];
