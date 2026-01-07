import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ITimesheetSubmissionData } from '../../../interfaces/dashboard/IDashboard';

interface IHoursChartSectionProps {
  data: ITimesheetSubmissionData[];
  totalUsers: number;
}

const HoursChartSection: React.FC<IHoursChartSectionProps> = ({ data, totalUsers }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Weekly Timesheet Submitted Users
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Number of users who submitted timesheets this week
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ width: '100%', height: 280, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  fontSize: 12
                }}
                formatter={(value) => [`${value ?? 0} users`, 'Submitted']}
              />
              <Bar 
                dataKey="submissions" 
                fill="#1976d2" 
                radius={[8, 8, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HoursChartSection;
