import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IProjectTypeSelectProps, ProjectType } from "../../../interfaces/project/IProject";

const ProjectTypeSelect: React.FC<IProjectTypeSelectProps> = ({ value, onChange, error, helperText }) => {
  const theme = useTheme();
  return (
    <FormControl size="small" fullWidth variant="outlined" error={error}>
      <InputLabel required id="project-type-label">Project Type</InputLabel>
      <Select
        labelId="project-type-label"
        value={value || ''}
        label="Project Type"
        onChange={(e) => onChange(e.target.value as ProjectType)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              backgroundColor: theme.palette.background.default,
            },
          },
        }}
      >
        <MenuItem value="Fixed Bid">Fixed Bid</MenuItem>
        <MenuItem value="T&M">T&M</MenuItem>
        <MenuItem value="Retainer">Retainer</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ProjectTypeSelect;