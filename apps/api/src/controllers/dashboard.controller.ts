import { Request, Response } from 'express';
import {
  getDashboardStatsService,
  getWeeklyTimesheetSubmissionsService,
  getRecentActivitiesService,
  getProjectProgressService,
  getTimesheetStatsService,
} from '../services/dashboard.service';

/**
 * Dashboard summary cards
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).userRole;

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await getDashboardStatsService(userRole);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * Weekly timesheet submissions (bar chart)
 */
export const getWeeklyTimesheetSubmissions = async (
  req: Request,
  res: Response
) => {
  try {
    const { weekStart, weekEnd } = req.query;

    const data = await getWeeklyTimesheetSubmissionsService(
      weekStart as string | undefined,
      weekEnd as string | undefined
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch weekly timesheet submissions',
    });
  }
};

/**
 * Recent dashboard activities
 */
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const data = await getRecentActivitiesService();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch recent activities',
    });
  }
};

/**
 * Project progress timeline
 */
export const getProjectProgress = async (req: Request, res: Response) => {
  try {
    const data = await getProjectProgressService();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch project progress',
    });
  }
};

/**
 * Monthly timesheet status stats (pie chart)
 */
export const getTimesheetStats = async (req: Request, res: Response) => {
  try {
    const data = await getTimesheetStatsService();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch timesheet statistics',
    });
  }
};
