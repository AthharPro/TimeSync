import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePickerFieldProps } from 'apps/ui/src/interfaces';

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
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value}
        onChange={onChange}
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
