import { UserModel } from '../models/user.model';
import ProjectModel from '../models/project.model';
import { Timesheet } from '../models/timesheet.model';
import HistoryModel from '../models/history.model';
import { DailyTimesheetStatus, UserRole } from '@tms/shared';

/**
 * Dashboard main stats (cards)
 */
export const getDashboardStatsService = async (userRole: UserRole) => {
  const today = new Date();

  // Month range
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const [
    activeProjects,
    allProjects,
    supervisorAdmins,
    adminUsers,
    totalUsers,
    submittedThisMonthAgg,
  ] = await Promise.all([
    ProjectModel.countDocuments({ status: true }),
    ProjectModel.countDocuments({}),
    UserModel.countDocuments({
      role: UserRole.SupervisorAdmin,
      status: true,
    }),
    UserModel.countDocuments({
      role: UserRole.Admin,
      status: true,
    }),
    UserModel.countDocuments({ status: true }),

    // Unique users who submitted timesheets this month
    Timesheet.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lt: nextMonthStart },
          status: {
            $in: [
              DailyTimesheetStatus.Pending,
              DailyTimesheetStatus.Approved,
            ],
          },
        },
      },
      { $group: { _id: '$userId' } },
      { $count: 'count' },
    ]),
  ]);

  const submittedThisMonth = submittedThisMonthAgg[0]?.count || 0;
  const usersNotSubmitted = totalUsers - submittedThisMonth;

  const roleSpecificCard = 
    userRole === UserRole.SuperAdmin ? {
        title: 'Supervisor Admins',
        value: supervisorAdmins,
        change: adminUsers,
        changeLabel: 'Admin Users',
        icon: 'people',
        color: 'info',
    } : {
          title: 'Generate Report',
          value: '',
          change: '',
          changeLabel: 'Click to generate reports',
          icon: 'assessment',
          color: 'success',
          clickable: true,
          navigateTo: 'Reports',
    };

  return {
    stats: [
      {
        title: 'Active Projects',
        value: activeProjects,
        change: allProjects,
        changeLabel: 'Total Projects',
        icon: 'assignment',
        color: 'primary',
      },
      roleSpecificCard,
      {
        title: 'Manage Admin Accounts',
        value: '',
        change: '',
        changeLabel: 'Click to access accounts section',
        icon: 'personAddIcon',
        color: 'info',
        clickable: true,
        navigateTo: 'Accounts' 
      },
    ],
  };
};

/**
 * Weekly timesheet submissions (bar chart)
 */
export const getWeeklyTimesheetSubmissionsService = async (
  weekStart?: string,
  weekEnd?: string
) => {
  const start = weekStart ? new Date(weekStart) : new Date();
  const end = weekEnd ? new Date(weekEnd) : new Date(start);

  if (!weekStart || !weekEnd) {
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    end.setDate(start.getDate() + 7);
    end.setHours(0, 0, 0, 0);
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const totalUsers = await UserModel.countDocuments({ status: true });

  const submissionData = await Timesheet.aggregate([
    {
      $match: {
        date: { $gte: start, $lt: end },
        status: {
          $in: [
            DailyTimesheetStatus.Pending,
            DailyTimesheetStatus.Approved,
          ],
        },
      },
    },

    // Unique user per day
    {
      $group: {
        _id: {
          day: { $dayOfWeek: '$date' },
          userId: '$userId',
        },
      },
    },

    // Count users per day
    {
      $group: {
        _id: '$_id.day',
        submissions: { $sum: 1 },
      },
    },

    { $sort: { _id: 1 } },
  ]);

  const dayMap = submissionData.reduce((acc: any, item: any) => {
    acc[item._id - 1] = item.submissions;
    return acc;
  }, {});

  const data = days.map((day, index) => ({
    day,
    submissions: dayMap[index] || 0,
  }));

  return { data, totalUsers };
};

/**
 * Recent activities
 */
export const getRecentActivitiesService = async () => {
  const recentHistories = await HistoryModel.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const activities = recentHistories.map((history: any) => ({
    id: history._id.toString(),
    user: history.performedByName,
    email: history.performedByEmail,
    action: history.description,
    entityType: history.entityType,
    entityName: history.entityName,
    actionType: history.actionType,
    timestamp: history.createdAt,
  }));

  return { activities };
};

/**
 * Project progress
 */
export const getProjectProgressService = async () => {
  const projects = await ProjectModel.find({ 
    status: true,
    startDate: { $exists: true, $ne: null },
    endDate: { $exists: true, $ne: null }
  })
    .select('projectName startDate endDate createdAt')
    .limit(10)
    .lean();

  const projectProgress = projects.map((project: any) => ({
    id: project._id.toString(),
    projectName: project.projectName,
    startDate: project.startDate,
    endDate: project.endDate,
  }));

  return { projects: projectProgress };
};

/**
 * Monthly timesheet stats (pie chart)
 */
export const getTimesheetStatsService = async () => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const match = {
    date: { $gte: monthStart, $lt: nextMonthStart },
  };

  const [pending, approved, draft, rejected] = await Promise.all([
    Timesheet.countDocuments({ ...match, status: DailyTimesheetStatus.Pending }),
    Timesheet.countDocuments({ ...match, status: DailyTimesheetStatus.Approved }),
    Timesheet.countDocuments({ ...match, status: DailyTimesheetStatus.Draft }),
    Timesheet.countDocuments({ ...match, status: DailyTimesheetStatus.Rejected }),
  ]);

  return {
    stats: [
      { status: 'Pending', count: pending, color: '#F59E0B' },
      { status: 'Approved', count: approved, color: '#22C55E' },
      { status: 'Draft', count: draft, color: '#3B82F6' },
      { status: 'Rejected', count: rejected, color: '#EF4444' },
    ],
  };
};
