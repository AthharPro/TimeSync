import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface QuickDateFilterProps {
  onDateRangeSelect: (start: string | undefined, end: string | undefined) => void;
  disabled?: boolean;
}

const QuickDateFilter: React.FC<QuickDateFilterProps> = ({ onDateRangeSelect, disabled = false }) => {
  const [selectedYear, setSelectedYear] = React.useState<string>('');
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');

  // Generate year options (current year and previous 5 years)
  const getYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year.toString());
    }
    return years;
  };

  // Generate month options (last 12 months from current date)
  const getMonthOptions = () => {
    const months = [];
    const currentDate = dayjs();
    
    for (let i = 0; i < 12; i++) {
      const date = currentDate.subtract(i, 'month');
      months.push({
        value: date.format('YYYY-MM'),
        label: date.format('MMMM YYYY'),
      });
    }
    return months;
  };

  const yearOptions = getYearOptions();
  const monthOptions = getMonthOptions();

  const handleYearChange = (year: string) => {
    if (year === '') {
      setSelectedYear('');
      setSelectedMonth('');
      onDateRangeSelect(undefined, undefined);
    } else {
      setSelectedYear(year);
      setSelectedMonth(''); // Clear month selection
      const startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
      const endDate = dayjs(`${year}-12-31`).format('YYYY-MM-DD');
      onDateRangeSelect(startDate, endDate);
    }
  };

  const handleMonthChange = (month: string) => {
    if (month === '') {
      setSelectedMonth('');
      setSelectedYear('');
      onDateRangeSelect(undefined, undefined);
    } else {
      setSelectedMonth(month);
      setSelectedYear(''); // Clear year selection
      const startDate = dayjs(month).startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs(month).endOf('month').format('YYYY-MM-DD');
      onDateRangeSelect(startDate, endDate);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Quick Filter - Year</InputLabel>
        <Select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          label="Quick Filter - Year"
          disabled={disabled}
        >
          <MenuItem value="">None</MenuItem>
          {yearOptions.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Quick Filter - Month</InputLabel>
        <Select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          label="Quick Filter - Month"
          disabled={disabled}
        >
          <MenuItem value="">None</MenuItem>
          {monthOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default QuickDateFilter;
