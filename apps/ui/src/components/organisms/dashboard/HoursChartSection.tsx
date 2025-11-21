import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IHoursChartData } from '../../../interfaces/dashboard/IDashboard';

interface IHoursChartSectionProps {
  data: IHoursChartData[];
}

const HoursChartSection: React.FC<IHoursChartSectionProps> = ({ data }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Weekly Hours Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Time logged over the last 7 days
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ width: '100%', height: 280 }}>
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
                formatter={(value: number) => [`${value} hours`, 'Logged']}
              />
              <Bar 
                dataKey="hours" 
                fill="#1976d2" 
                radius={[8, 8, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={600} color="primary">
              {data.reduce((acc, curr) => acc + curr.hours, 0)}h
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Hours
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={600} color="success.main">
              {(data.reduce((acc, curr) => acc + curr.hours, 0) / data.length).toFixed(1)}h
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Daily Average
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={600} color="warning.main">
              {Math.max(...data.map(d => d.hours))}h
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Peak Day
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HoursChartSection;
