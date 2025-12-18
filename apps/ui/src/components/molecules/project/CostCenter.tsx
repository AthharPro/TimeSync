import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { CostCenter, ICostCenterSelectProps } from "../../../interfaces/project/IProject";

const CostCenterSelect: React.FC<ICostCenterSelectProps> = ({ value, onChange, error, helperText }) => {
  const theme = useTheme();
  return (
    <FormControl size="small" fullWidth variant="outlined" error={error}>
      <InputLabel required id="cost-center-label">Cost Center</InputLabel>
      <Select
        labelId="cost-center-label"
        value={value || ''}
        label="Cost Center"
        onChange={(e) => onChange(e.target.value as CostCenter)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              backgroundColor: theme.palette.background.default,
            },
          },
        }}
      >
        <MenuItem value="Canada">Canada</MenuItem>
        <MenuItem value="Australia">Australia</MenuItem>
        <MenuItem value="Sweden">Sweden</MenuItem>
        <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default CostCenterSelect;