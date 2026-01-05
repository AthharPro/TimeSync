import API from '../config/apiClient';
import {
  IStatCard,
  IProjectProgress,
  IRecentActivity,
  ITimesheetSubmissionData,
  ITimesheetSubmission,
} from '../interfaces/dashboard/IDashboard';

/**
 * Fetch dashboard statistics
 */
export const getDashboardStats = async (): Promise<{ stats: IStatCard[] }> => {
  const response = await API.get('/api/dashboard/stats');
  return response.data;
};

/**
 * Fetch weekly timesheet submission data
 */
export const getWeeklyTimesheetSubmissions = async (
  weekStart?: Date,
  weekEnd?: Date
): Promise<{ data: ITimesheetSubmissionData[]; totalUsers: number }> => {
  
  const params = weekStart && weekEnd ? {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  } : {};

  const response = await API.get('/api/dashboard/weekly-submissions', { params });
  return response.data;
};

/**
 * Fetch recent activities
 */
export const getRecentActivities = async (): Promise<{
  activities: IRecentActivity[];
}> => {
  const response = await API.get('/api/dashboard/activities');
  return response.data;
};

/**
 * Fetch project progress data
 */
export const getProjectProgress = async (): Promise<{
  projects: IProjectProgress[];
}> => {
  const response = await API.get('/api/dashboard/projects');
  return response.data;
};

/**
 * Fetch timesheet submission statistics
 */
export const getTimesheetStats = async (): Promise<{
  stats: ITimesheetSubmission[];
}> => {
  const response = await API.get('/api/dashboard/timesheet-stats');
  return response.data;
};
