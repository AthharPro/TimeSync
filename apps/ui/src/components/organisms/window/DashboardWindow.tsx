import React, { useState, useEffect } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import { Box, Divider, CircularProgress, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BaseBtn } from '../../atoms';
import StatCard from '../../molecules/dashboard/StatCard';
import ProjectProgressSection from '../dashboard/ProjectProgressSection';
import RecentActivitySection from '../dashboard/RecentActivitySection';
import CalendarSection from '../dashboard/CalendarSection';
import HoursChartSection from '../dashboard/HoursChartSection';
import TimesheetPieChartSection from '../dashboard/TimesheetPieChartSection';

import {
  getDashboardStats,
  getWeeklyTimesheetSubmissions,
  getRecentActivities,
  getProjectProgress,
  getTimesheetStats,
} from '../../../api/dashboard';
import { IStatCard, IProjectProgress, IRecentActivity, ITimesheetSubmissionData, ITimesheetSubmission } from '../../../interfaces/dashboard/IDashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { startOfWeek, endOfWeek } from 'date-fns';

function DashboardWindow() {
  const [stats, setStats] = useState<IStatCard[]>([]);
  const [selectedWeekData, setSelectedWeekData] = useState<ITimesheetSubmissionData[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [projectData, setProjectData] = useState<IProjectProgress[]>([]);
  const [activities, setActivities] = useState<IRecentActivity[]>([]);
  const [timesheetData, setTimesheetData] = useState<ITimesheetSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, submissionsRes, projectsRes, activitiesRes, timesheetRes] = await Promise.all([
        getDashboardStats(),
        getWeeklyTimesheetSubmissions(),
        getProjectProgress(),
        getRecentActivities(),
        getTimesheetStats(),
      ]);

      setStats(statsRes.stats);
      setSelectedWeekData(submissionsRes.data);
      setTotalUsers(submissionsRes.totalUsers);
      setProjectData(projectsRes.projects);
      setActivities(activitiesRes.activities);
      setTimesheetData(timesheetRes.stats);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDateSelect = async (date: Date) => {
  try {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

    const submissionsRes = await getWeeklyTimesheetSubmissions(
      weekStart,
      weekEnd
    );

    setSelectedWeekData(submissionsRes.data);
    setTotalUsers(submissionsRes.totalUsers);
  } catch (err) {
    setError('Failed to load selected week data');
  } finally {
    setLoading(false);
  }
};

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Map of icon keys from backend -> MUI icon nodes
  const iconMap: Record<string, React.ReactNode> = {
    assignment: <AssignmentIcon />,
    people: <PeopleIcon />,
    accesstime: <AccessTimeIcon />,
  };

  if (loading) {
    return (
      <WindowLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </WindowLayout>
    );
  }

  return (
    <WindowLayout
      title="Dashboard"
      
    >
      <Box sx={{ flexGrow: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Main Content Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 2fr 1fr',
            },
            gap: 3,
            mb: 3,
          }}
        >
          {/* First Column - Stats Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {stats.length > 0 ? (
              stats.map((stat, index) => {
                // Backend may send either a string key (recommended) or a React node.
                const iconNode = typeof stat.icon === 'string'
                  ? (iconMap[stat.icon] ?? <AssignmentIcon />)
                  : (stat.icon as React.ReactNode);

                return <StatCard key={index} {...stat} icon={iconNode} />;
              })
            ) : (
              <Alert severity="info">No stats available</Alert>
            )}
          </Box>

          {/* Second Column - Hours Chart */}
          <HoursChartSection data={selectedWeekData} totalUsers={totalUsers} />

          {/* Third Column - Calendar */}
          <CalendarSection onDateSelect={handleDateSelect} />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Second Row - Project Progress, Recent Activity, Timesheet Chart */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          <ProjectProgressSection projects={projectData} />
          <RecentActivitySection activities={activities} />
          <TimesheetPieChartSection data={timesheetData} />
        </Box>
      </Box>
    </WindowLayout>
  );
}

export default DashboardWindow;
