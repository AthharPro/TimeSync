import React from 'react';
import { Popover, Box, Typography, TextField } from '@mui/material';
import { DescriptionPopoverProps } from './../../../interfaces/component/organism';

const DescriptionPopover: React.FC<DescriptionPopoverProps> = ({
  anchorEl,
  description,
  onClose,
  onDescriptionChange,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 2, width: 300 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Description
        </Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder="Enter description..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          variant="outlined"
          onKeyDown={handleKeyDown}
        />
      </Box>
    </Popover>
  );
};

export default DescriptionPopover;
