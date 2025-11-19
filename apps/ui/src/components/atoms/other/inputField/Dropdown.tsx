import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { IDropdownProps } from '../../../../interfaces';

const Dropdown = <T extends string | number>({
  value,
  onChange,
  options,
  labels,
  onClick,
  size = 'small',
  variant = 'standard',
  sx,
}: IDropdownProps<T>) => {
  const handleChange = (e: SelectChangeEvent<T>) => {
    onChange(e.target.value as T);
  };

  const enumValues = Object.values(options) as T[];

  const getLabel = (enumValue: T): string => {
    if (labels && labels[enumValue]) {
      return labels[enumValue];
    }
    return String(enumValue);
  };

  return (
    <Select
      size={size}
      value={value}
      onChange={handleChange}
      onClick={onClick}
      variant={variant}
      sx={{
        width: '100%',
        '&:before': {
          borderBottom: 'none',
        },
        '&:after': {
          borderBottom: 'none',
        },
        '&:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
        ...sx,
      }}
    >
      {enumValues.map((enumValue) => (
        <MenuItem key={String(enumValue)} value={enumValue}>
          {getLabel(enumValue)}
        </MenuItem>
      ))}
    </Select>
  );
};

export default Dropdown;
