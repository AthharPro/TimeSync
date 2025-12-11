import React from 'react';
import { ButtonGroup, Button } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { QuickDateButtonsProps } from '../../../interfaces/report/IReportFilter';

const QuickDateButtons: React.FC<QuickDateButtonsProps> = ({ 
  onDateRangeSelect, 
  disabled = false 
}) => {
  const handleToday = () => {
    const today = dayjs();
    onDateRangeSelect(today, today);
  };

  const handleThisWeek = () => {
    const start = dayjs().startOf('week');
    const end = dayjs().endOf('week');
    onDateRangeSelect(start, end);
  };

  const handleLast7Days = () => {
    const end = dayjs();
    const start = end.subtract(6, 'day');
    onDateRangeSelect(start, end);
  };

  const handleThisMonth = () => {
    const start = dayjs().startOf('month');
    const end = dayjs().endOf('month');
    onDateRangeSelect(start, end);
  };

  return (
    <ButtonGroup size="small" variant="outlined" disabled={disabled}>
      <Button onClick={handleToday}>Today</Button>
      <Button onClick={handleThisWeek}>This Week</Button>
      <Button onClick={handleLast7Days}>Last 7 Days</Button>
      <Button onClick={handleThisMonth}>This Month</Button>
    </ButtonGroup>
  );
};

export default QuickDateButtons;
