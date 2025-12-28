import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from '@mui/material/styles';
import { Dayjs } from 'dayjs';
import { DatePickerAtomProps } from '../../../interfaces/report/IReportFilter';

const DatePickerAtom: React.FC<DatePickerAtomProps> = ({ label, value, onChange, disabled, minDate, views, openTo }) => {
  const theme = useTheme();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={label}
          value={value ? dayjs(value) : null}
          onChange={(newValue) => onChange(newValue as dayjs.Dayjs | null)}
          disabled={disabled}
          minDate={minDate}
          views={views}
          openTo={openTo}
          enableAccessibleFieldDOMStructure={false}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small'
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerAtom;
