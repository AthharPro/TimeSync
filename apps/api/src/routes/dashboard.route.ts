import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import {
  getDashboardStats,
  getWeeklyTimesheetSubmissions,
  getRecentActivities,
  getProjectProgress,
  getTimesheetStats,
} from '../controllers/dashboard.controller';

const router = Router();

// authenticate(); // authenitcates only one time
router.use(authenticate());

// Get main dashboard statistics (active projects, admins, timesheet status)
router.get('/stats', getDashboardStats);

// Get weekly timesheet submission data
router.get('/weekly-submissions',  getWeeklyTimesheetSubmissions);

// Get recent activities
router.get('/activities', getRecentActivities);

// Get project progress data
router.get('/projects',  getProjectProgress);

// Get timesheet submission statistics
router.get('/timesheet-stats', getTimesheetStats);

export default router;
