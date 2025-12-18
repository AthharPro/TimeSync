import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import ProjectModel from '../models/project.model';
import { Timesheet } from '../models/timesheet.model';
import { DailyTimesheetStatus, UserRole } from '@tms/shared';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // ---- Date Calculations (once) ----
    const today = new Date();

    // Start of current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Start of next month
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    monthEnd.setHours(0, 0, 0, 0);

    // ---- Parallel DB Queries ----
    const [
      activeProjects,
      allProjects,
      supervisorAdmins,
      adminUsers,
      totalUsers,
      submittedThisMonthAgg,
    ] = await Promise.all([
      // Active projects
      ProjectModel.countDocuments({ status: true }),

      // All projects
      ProjectModel.countDocuments({}),

      // Supervisor Admins
      UserModel.countDocuments({
        role: UserRole.SupervisorAdmin,
        status: true,
      }),

      // Admin users
      UserModel.countDocuments({ role: UserRole.Admin, status: true }),

      // Total active users
      UserModel.countDocuments({ status: true }),

      // Users who submitted timesheet THIS MONTH
      Timesheet.aggregate([
        {
          $match: {
            status: {
              $in: [
                DailyTimesheetStatus.Pending,
                DailyTimesheetStatus.Approved,
              ],
            },
            date: { $gte: monthStart, $lt: monthEnd },
          },
        },
        { $group: { _id: '$userId' } },
        { $count: 'count' },
      ]),
    ]);

    const submittedThisMonth = submittedThisMonthAgg[0]?.count || 0;
    const usersNotSubmitted = totalUsers - submittedThisMonth;

    res.status(200).json({
      stats: [
        {
          title: 'Active Projects',
          value: activeProjects,
          change: allProjects,
          changeLabel: 'Total Projects',
          icon: 'assignment',
          color: 'primary',
        },
        {
          title: 'Supervisor Admins',
          value: supervisorAdmins,
          change: adminUsers,
          changeLabel: 'Admin Users',
          icon: 'people',
          color: 'info',
        },
        {
          title: 'Users Not Submitted Timesheets',
          value: usersNotSubmitted,
          change: submittedThisMonth,
          changeLabel: `submitted This Month`,
          icon: 'accesstime',
          color: 'warning',
        },
      ],
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * Get weekly timesheet submission data
 * Returns number of timesheet submissions per day of the week
 */
export const getWeeklyTimesheetSubmissions = async (
  req: Request,
  res: Response
) => {
  try {

    const { weekStart, weekEnd } = req.query;

    const start = weekStart ? new Date(weekStart as string) : new Date();
    const end = weekEnd ? new Date(weekEnd as string) : new Date(start);

    if (!weekStart || !weekEnd) {
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);

      end.setDate(start.getDate() + 7);
      end.setHours(0, 0, 0, 0);
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [totalUsers] = await Promise.all([
      UserModel.countDocuments({ status: true }),
    ]);

    // Use MongoDB aggregation for better performance (single query instead of 7)
    const submissionData = await Timesheet.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: end },
          status: {
            $in: [DailyTimesheetStatus.Pending, DailyTimesheetStatus.Approved],
          },
        },
      },

      // STEP 1: unique user per day
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$date' }, // 1 (Sun) - 7 (Sat)
            userId: '$userId',
          },
        },
      },

      // STEP 2: count users per day
      {
        $group: {
          _id: '$_id.day',
          submissions: { $sum: 1 }, // each user counted once
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);

    // Map aggregation results to day labels
    const dayMap = submissionData.reduce((acc: any, item: any) => {
      acc[item._id - 1] = item.submissions; // dayOfWeek returns 1-7, convert to 0-6
      return acc;
    }, {});

    const result = days.map((day, index) => ({
      day,
      submissions: dayMap[index] || 0,
    }));

    res.status(200).json({ data: result, totalUsers });
  } catch (error) {
    console.error('Error fetching weekly submissions:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch weekly timesheet submissions' });
  }
};

/**
 * Get recent activities (timesheet submissions, project updates, etc.)
 */
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    // Get recent timesheet submissions (last 10) - only this week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const recentTimesheets = await Timesheet.find({
      date: { $gte: weekStart },
      status: {
        $in: [DailyTimesheetStatus.Pending, DailyTimesheetStatus.Approved],
      },
    })
      .populate('userId', 'firstName lastName')
      .populate('projectId', 'projectName')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const activities = recentTimesheets.map((ts: any) => ({
      id: ts._id.toString(),
      user: ts.userId?.firstName + ' ' + ts.userId?.lastName || 'Unknown',
      action: `Submitted timesheet (${ts.hours} hours)`,
      project: ts.projectId?.projectName || 'Unassigned',
      timestamp: ts.updatedAt,
    }));

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

/**
 * Get project progress data
 */
export const getProjectProgress = async (req: Request, res: Response) => {
  try {
    const projects = await ProjectModel.find({ status: true })
      .select('projectName createdAt')
      .limit(5)
      .lean();

    const projectProgress = projects.map((project: any) => ({
      id: project._id.toString(),
      projectName: project.projectName,
      startDate: project.createdAt,
      endDate: new Date(
        new Date(project.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000
      ), // 90 days from start
    }));

    res.status(200).json({ projects: projectProgress });
  } catch (error) {
    console.error('Error fetching project progress:', error);
    res.status(500).json({ error: 'Failed to fetch project progress' });
  }
};

/**
 * Get timesheet submission statistics (for pie chart)
 */
export const getTimesheetStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const submitted = await Timesheet.countDocuments({
      date: { $gte: monthStart, $lte: monthEnd },
      status: DailyTimesheetStatus.Approved,
    });

    const approved = await Timesheet.countDocuments({
      date: { $gte: monthStart, $lte: monthEnd },
      status: DailyTimesheetStatus.Approved,
    });

    const draft = await Timesheet.countDocuments({
      date: { $gte: monthStart, $lte: monthEnd },
      status: DailyTimesheetStatus.Draft,
    });

    const stats = [
      { status: 'Submitted', count: submitted, color: '#FFC658' },
      { status: 'Approved', count: approved, color: '#91D1BA' },
      { status: 'Draft', count: draft, color: '#B6A2DE' },
    ];

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching timesheet stats:', error);
    res.status(500).json({ error: 'Failed to fetch timesheet statistics' });
  }
};
