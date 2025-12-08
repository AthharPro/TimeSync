import {
  Autocomplete,
  TextField,
} from '@mui/material';
import { AutocompleteTextProps } from '../../../../interfaces';

const AutocompleteText = <T,>({
  value,
  onChange,
  options,
  variant = 'standard',
  placeholder,
}: AutocompleteTextProps<T>) => {

  return (
    <Autocomplete<T, false, true, false>
      size="small"
      value={value ?? undefined}
      onChange={onChange}
      options={options}
      onClick={(e) => e.stopPropagation()}
      disableClearable
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant}
          placeholder={placeholder}
          sx={{
            ...(variant === 'standard' && {
              '& .MuiInput-underline:before': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:after': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
            }),
          }}
        />
      )}
    />
  );
};

export default AutocompleteText;