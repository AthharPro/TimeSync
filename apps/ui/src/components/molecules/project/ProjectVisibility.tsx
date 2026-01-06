import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IProjectVisibilityProps } from "../../../interfaces/project/IProject";

const ProjectVisibility: React.FC<IProjectVisibilityProps> = ({ value, onChange, error, helperText }) => {
  const theme = useTheme();
  return (
    <FormControl size="small" fullWidth variant="outlined" error={error}>
      <InputLabel required id="visibility-label">Visibility Type</InputLabel>
      <Select
        labelId="visibility-label"
        value={value}
        label="Visibility Type"
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
        <MenuItem value="public">Public</MenuItem>
        <MenuItem value="private">Private</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ProjectVisibility;
