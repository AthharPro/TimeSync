import React from 'react';
import { Box, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import DatePickerAtom from '../../atoms/report/DatePickerAtom';
import { DateRangePickerProps } from '../../../interfaces/report/IReportFilter';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
}) =>  (

  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      gap: 2,
      flexWrap: 'nowrap',
    }}
  >
    {/* Start Date */}
    <Box sx={{ flex: 1, minWidth: 240 }}>
      <DatePickerAtom
        label="Start Date"
        value={startDate || null}
        onChange={onStartDateChange}
        disabled={disabled}
      />
      {!startDate && 
      (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Optional: choose a start date
        </Typography>
      )}
    </Box>
    {/* End Date */}
    <Box sx={{ flex: 1, minWidth: 240 }}>
      <DatePickerAtom
        label="End Date"
        value={endDate || null}
        onChange={onEndDateChange}
        disabled={disabled}
        minDate={startDate ? dayjs(startDate) : undefined}
      />
      {!endDate && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Optional: choose an end date
        </Typography>
      )}
    </Box>
  </Box>
);

export default DateRangePicker;
