import { useState, useEffect } from 'react';
import { Autocomplete, TextField, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AutocompleteWithCreateProps {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (event: any, newValue: string | null) => void;
  onCreateNew?: (newValue: string) => Promise<void>;
  disabled?: boolean;
  label?: string;
}

const AutocompleteWithCreate = ({
  value,
  options,
  placeholder = '',
  onChange,
  onCreateNew,
  disabled = false,
  label,
}: AutocompleteWithCreateProps) => {
  const [inputValue, setInputValue] = useState('');
  const [creating, setCreating] = useState(false);

  // Sync inputValue with value prop when value changes
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const handleCreateNew = async (taskName: string) => {
    if (taskName.trim() && onCreateNew) {
      setCreating(true);
      try {
        await onCreateNew(taskName.trim());
        // Don't clear inputValue here - let it be controlled by the value prop
      } catch (error) {
      } finally {
        setCreating(false);
      }
    }
  };

  const showCreateOption = 
    inputValue.trim() !== '' && 
    !options.includes(inputValue.trim()) &&
    onCreateNew !== undefined;

  // Add "Create new" option at the beginning if conditions are met
  const displayOptions = showCreateOption 
    ? [`__CREATE_NEW__${inputValue.trim()}`, ...options]
    : options;

  return (
    <Autocomplete
      value={value}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        // Check if user clicked the "Create new" option
        if (typeof newValue === 'string' && newValue.startsWith('__CREATE_NEW__')) {
          const taskName = newValue.replace('__CREATE_NEW__', '');
          // First update the parent component with the task name
          onChange(event, taskName);
          // Then create the task in the background
          handleCreateNew(taskName);
        } else {
          onChange(event, newValue);
        }
      }}
      options={displayOptions}
      disabled={disabled}
      size="small"
      sx={{
        '& .MuiInputBase-root': {
          fontSize: '0.875rem',
          padding: '0px',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: 'none',
          },
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
          color: 'rgba(0, 0, 0, 0.87)',
        },
      }}
      renderOption={(props, option) => {
        // Render special "Create new" option
        if (typeof option === 'string' && option.startsWith('__CREATE_NEW__')) {
          const taskName = option.replace('__CREATE_NEW__', '');
          return (
            <MenuItem
              {...props}
              key={option}
              sx={{
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
                borderBottom: '1px solid #ddd',
              }}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={`Create "${taskName}"`}
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  color: 'primary',
                }}
              />
            </MenuItem>
          );
        }
        // Render regular options
        return (
          <MenuItem {...props} key={option}>
            {option}
          </MenuItem>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          label={label}
          variant="outlined"
          size="small"
        />
      )}
    />
  );
};

export default AutocompleteWithCreate;
