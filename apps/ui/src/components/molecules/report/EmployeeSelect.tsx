import React, { useState, useMemo } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  OutlinedInput, 
  Checkbox, 
  ListItemText, 
  Box, 
  TextField,
  InputAdornment,
  Typography,
  useTheme 
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { EmployeeSelectProps } from '../../../interfaces/report/IReportFilter'
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ employees, selectedIds, onChange, disabled, multiple = true }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  // Support single or multiple selection
  const isMultiple = multiple && Array.isArray(selectedIds);
  
  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    return employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const email = employee.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search);
    });
  }, [employees, searchTerm]);

  // Function to highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor:theme.palette.background.paper, fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };
  
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        backgroundColor: theme.palette.background.default,
      },
    },
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectChange = (event: any) => {
    const value = event.target.value;
    if (isMultiple) {
      // Multiple selection: value is already an array
      onChange(typeof value === 'string' ? value.split(',') : value);
    } else {
      // Single selection: wrap value in an array
      onChange(value ? [value] : []);
    }
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>Employees</InputLabel>
      <Select
        multiple={isMultiple}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          setSearchTerm(''); 
        }}
        value={isMultiple ? selectedIds : (selectedIds.length > 0 ? selectedIds[0] : '')}
        onChange={handleSelectChange}
        input={<OutlinedInput label="Employees" />}
        renderValue={selected => (
          isMultiple ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map(employeeId => {
                const employee = employees.find(emp => emp._id === employeeId);
                return (
                  <Chip
                    key={employeeId}
                    label={employee ? `${employee.firstName} ${employee.lastName}` : employeeId}
                    size="small"
                  />
                );
              })}
            </Box>
          ) : (
            (() => {
              const employeeId = selected as string;
              const employee = employees.find(emp => emp._id === employeeId);
              return employee ? `${employee.firstName} ${employee.lastName}` : '';
            })()
          )
        )}
        MenuProps={MenuProps}
      >
        {/* Search Input */}
        <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>

        {/* Search Results Header */}
        {searchTerm.trim() && (
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Results for "{searchTerm}" ({filteredEmployees.length} found)
            </Typography>
          </Box>
        )}

        {/* Employee List */}
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(employee => (
            <MenuItem 
              key={employee._id} 
              value={employee._id}
              sx={{
                bgcolor: theme.palette.background.default,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              {isMultiple && (
                <Checkbox 
                  checked={selectedIds.indexOf(employee._id) > -1} 
                />
              )}
              <ListItemText 
                primary={highlightText(`${employee.firstName} ${employee.lastName}`, searchTerm)}
                secondary={highlightText(employee.email, searchTerm)}
              />
            </MenuItem>
          ))
        ) : searchTerm.trim() ? (
          <MenuItem disabled>
            <ListItemText 
              primary={`No employees found for "${searchTerm}"`}
              secondary="Try a different search term"
            />
          </MenuItem>
        ) : (
          <MenuItem disabled>
            <ListItemText primary="No employees available" />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default EmployeeSelect;
