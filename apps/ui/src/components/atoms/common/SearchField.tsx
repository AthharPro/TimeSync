import React from 'react';
import { InputAdornment } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import type { ISearchFieldProps } from '../../../interfaces/common/IProjectTeam';

const SearchField: React.FC<ISearchFieldProps> = ({
  value,
  onChange,
  placeholder ,
  label,
  fullWidth = true,
  sx,
}) => {
  return (
    <BaseTextField
      fullWidth={fullWidth}
      label={label}
      placeholder={placeholder}
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{mt: 2, ...sx}}
      size='small'
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchField;