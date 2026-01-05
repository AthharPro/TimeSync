import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ITimesheetSubmission } from '../../../interfaces/dashboard/IDashboard';

interface ITimesheetPieChartSectionProps {
  data: ITimesheetSubmission[];
}

const TimesheetPieChartSection: React.FC<ITimesheetPieChartSectionProps> = ({ data }) => {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Timesheet Submissions
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current Month Status breakdown
        </Typography>
        <Divider sx={{ my: 2 }} />

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry: any) => `${entry.status}: ${entry.count}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <Box mt={2}>
          <Divider sx={{ mb: 2 }} />
          {data.map((item, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '2px',
                    backgroundColor: item.color,
                  }}
                />
                <Typography variant="body2">{item.status}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {item.count} ({Math.round((item.count / totalCount) * 100)}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimesheetPieChartSection;
