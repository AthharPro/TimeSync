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
  label,
  minDate,
  views,
  openTo,
  disabled = false,
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
        minDate={minDate}
        label={label}
        views={views}
        openTo={openTo}
        disabled={disabled}
        slots={{
          openPickerIcon: () => null,
        }}
        slotProps={{
          textField: {
            size,
            variant,
            InputProps: {
              disableUnderline: variant === 'standard',
            },
            onClick: (e) => {
              e.stopPropagation();
              if (!disabled) {
                onClick?.(e);
              }
            },
            sx: {
              width,
              cursor: 'pointer',
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                color: 'rgba(0, 0, 0, 0.87)',
              },
              ...sx,
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
