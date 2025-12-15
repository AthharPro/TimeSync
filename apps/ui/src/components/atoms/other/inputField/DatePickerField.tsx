import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePickerFieldProps } from '../../../../interfaces';

const DatePickerField = ({
  value,
  onChange,
  open = false,
  onOpen,
  onClose,
  onClick,
  width = '130px',
  variant = 'standard',
  size = 'small',
  sx = {},
}: DatePickerFieldProps) => {
  const handleDateChange = (newValue: unknown) => {
    // Convert Dayjs or other PickerValue types to Date
    if (newValue instanceof Date) {
      onChange(newValue);
    } else if (newValue && typeof newValue === 'object' && 'toDate' in newValue) {
      // Handle Dayjs objects
      onChange((newValue as any).toDate());
    } else {
      onChange(null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value}
        onChange={handleDateChange}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        slots={{
          openPickerIcon: () => null,
        }}
        slotProps={{
          textField: {
            size,
            variant,
            InputProps: {
              disableUnderline: true,
            },
            onClick: (e) => {
              e.stopPropagation();
              onClick?.(e);
            },
            sx: {
              width,
              cursor: 'pointer',
              ...sx,
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
