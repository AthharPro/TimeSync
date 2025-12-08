import React, { useState } from 'react';
import WindowLayout from '../../templates/other/WindowLayout';
import { Box, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BaseBtn } from '../../atoms';
import StatCard from '../../molecules/dashboard/StatCard';
import ProjectProgressSection from '../dashboard/ProjectProgressSection';
import RecentActivitySection from '../dashboard/RecentActivitySection';
import CalendarSection from '../dashboard/CalendarSection';
import HoursChartSection from '../dashboard/HoursChartSection';
import TimesheetPieChartSection from '../dashboard/TimesheetPieChartSection';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import {
  dashboardStats,
  projectProgress,
  recentActivities,
  calendarEvents,
  weeklyTimesheetSubmissions,
  timesheetSubmissions,
} from '../../../data/dashboardData';

function DashboardWindow() {
  const [selectedWeekData, setSelectedWeekData] = useState(weeklyTimesheetSubmissions);

  const handleDateSelect = (date: Date) => {
    // Generate mock data for selected week
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
    
    // Generate random data for the selected week (in production, fetch from API)
    const newWeekData = [
      { day: 'Sun', submissions: Math.floor(Math.random() * 15) + 5 },
      { day: 'Mon', submissions: Math.floor(Math.random() * 20) + 30 },
      { day: 'Tue', submissions: Math.floor(Math.random() * 20) + 30 },
      { day: 'Wed', submissions: Math.floor(Math.random() * 20) + 30 },
      { day: 'Thu', submissions: Math.floor(Math.random() * 20) + 30 },
      { day: 'Fri', submissions: Math.floor(Math.random() * 20) + 30 },
      { day: 'Sat', submissions: Math.floor(Math.random() * 15) + 5 },
      
    ];
    
    setSelectedWeekData(newWeekData);
  };

  const handleRefresh = () => {
    console.log('Refreshing dashboard...');
    setSelectedWeekData(weeklyTimesheetSubmissions);
    // TODO: Implement refresh functionality
  };

  return (
    <WindowLayout
      title="Dashboard"
      
    >
      <Box sx={{ flexGrow: 1 }}>
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
            {dashboardStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </Box>

          {/* Second Column - Hours Chart */}
          <HoursChartSection data={selectedWeekData} />

          {/* Third Column - Calendar */}
          <CalendarSection events={calendarEvents} onDateSelect={handleDateSelect} />
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
          <ProjectProgressSection projects={projectProgress} />
          <RecentActivitySection activities={recentActivities} />
          <TimesheetPieChartSection data={timesheetSubmissions} />
        </Box>
      </Box>
    </WindowLayout>
  );
}

export default DashboardWindow;
