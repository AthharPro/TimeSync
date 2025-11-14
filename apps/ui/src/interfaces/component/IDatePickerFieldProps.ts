import type { Dayjs } from 'dayjs';

// Using Partial to make all DatePicker props optional and properly typed
export interface IDatePickerFieldProps {
  label?: string;
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  format?: string;
  slotProps?: unknown;
  ref?: React.Ref<HTMLDivElement>;
  [key: string]: unknown;
}
