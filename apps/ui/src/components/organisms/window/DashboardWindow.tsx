import React from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import { Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BaseBtn } from '../../atoms';
import StatCard from '../../atoms/dashboard/StatCard';
import ProjectProgressSection from '../dashboard/ProjectProgressSection';
import RecentActivitySection from '../dashboard/RecentActivitySection';
import CalendarSection from '../dashboard/CalendarSection';
import HoursChartSection from '../dashboard/HoursChartSection';
import TimesheetPieChartSection from '../dashboard/TimesheetPieChartSection';
import {
  dashboardStats,
  projectProgress,
  recentActivities,
  calendarEvents,
  weeklyHoursData,
  timesheetSubmissions,
} from '../../../data/dashboardData';

function DashboardWindow() {
  const handleRefresh = () => {
    console.log('Refreshing dashboard...');
    // TODO: Implement refresh functionality
  };

  return (
    <WindowLayout
      title="Dashboard"
      buttons={
        <BaseBtn
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </BaseBtn>
      }
    >
      <Box sx={{ flexGrow: 1 }}>
        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 3,
          }}
        >
          {dashboardStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </Box>

        {/* Main Content Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* First Row - Hours Chart and Calendar */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '7fr 3fr',
              },
              gap: 3,
            }}
          >
            <HoursChartSection data={weeklyHoursData} />
            <CalendarSection events={calendarEvents} />
          </Box>

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
            <ProjectProgressSection projects={projectProgress} />
            <RecentActivitySection activities={recentActivities} />
            <TimesheetPieChartSection data={timesheetSubmissions} />
          </Box>
        </Box>
      </Box>
    </WindowLayout>
  );
}

export default DashboardWindow;
