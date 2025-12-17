import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IBillableSelectProps } from "../../../interfaces/project/IProject";

const BillableSelect: React.FC<IBillableSelectProps> = ({ value, onChange, error, helperText }) => {
  const theme = useTheme();
  return (
    <FormControl size="small" fullWidth variant="outlined" error={error}>
      <InputLabel required id="billable-label">Billable</InputLabel>
      <Select
        labelId="billable-label"
        value={value || ''}
        label="Billable"
        onChange={(e) => onChange(e.target.value as string)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              backgroundColor: theme.palette.background.default,
            },
          },
        }}
      >
        <MenuItem value="yes">Yes</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default BillableSelect;