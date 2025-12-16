import React, { useState, useMemo } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  TextField,
  InputAdornment,
  Typography,
  useTheme,
  OutlinedInput,
  ListItemText
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ProjectTeamSelectProps } from '../../../interfaces/report/IReportFilter';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const ProjectTeamSelect: React.FC<ProjectTeamSelectProps> = ({ 
  items, 
  selectedId, 
  onChange, 
  disabled,
  label,
  placeholder
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  
  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    return items.filter(item => {
      const name = item.name.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return name.includes(search);
    });
  }, [items, searchTerm]);

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
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          setSearchTerm(''); 
        }}
        value={selectedId || ''}
        onChange={handleSelectChange}
        input={<OutlinedInput label={label} />}
        renderValue={selected => {
          if (!selected) return '';
          const item = items.find(i => i._id === selected);
          return item ? item.name : selected;
        }}
        MenuProps={MenuProps}
        displayEmpty
      >
        {/* Search Input */}
        <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            size="small"
            fullWidth
            placeholder={placeholder}
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
              Results for "{searchTerm}" ({filteredItems.length} found)
            </Typography>
          </Box>
        )}

        {/* Items List */}
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MenuItem 
              key={item._id} 
              value={item._id}
              sx={{
                bgcolor: theme.palette.background.default,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemText 
                primary={highlightText(item.name, searchTerm)}
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Typography variant="caption" component="span">
                      {item.userCount} user{item.userCount !== 1 ? 's' : ''}
                    </Typography>
                    {item.supervisor && (
                      <Typography variant="caption" component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Supervisor: {item.supervisor}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </MenuItem>
          ))
        ) : searchTerm.trim() ? (
          <MenuItem disabled>
            <ListItemText 
              primary={`No ${label.toLowerCase()} found for "${searchTerm}"`}
              secondary="Try a different search term"
            />
          </MenuItem>
        ) : (
          <MenuItem disabled>
            <ListItemText primary={`No ${label.toLowerCase()} available`} />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default ProjectTeamSelect;
