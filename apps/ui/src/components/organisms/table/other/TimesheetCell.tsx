import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import HoursField from '../../../atoms/other/inputField/HoursField';
import DescriptionPopover from '../../popover/DescriptionPopover';
import { TimesheetCellProps } from './../../../../interfaces/component/organism';


const TimesheetCell: React.FC<TimesheetCellProps> = ({
  hours,
  description = '',
  isTodayColumn,
  onHoursChange,
  onDescriptionChange,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasDescription = Boolean(description && description.trim().length > 0);

  const handleDescriptionClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDescriptionChange = (newDescription: string) => {
    if (onDescriptionChange) {
      onDescriptionChange(newDescription);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1 }}>
        <HoursField
          value={hours}
          onChange={onHoursChange}
        />
        <Tooltip title={hasDescription ? 'Edit description' : 'Add description'}>
          <IconButton
            size="small"
            onClick={handleDescriptionClick}
            sx={{
              padding: '2px',
              color: hasDescription ? theme.palette.primary.main : theme.palette.action.disabled,
            }}
          >
            <AddOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <DescriptionPopover
        anchorEl={anchorEl}
        description={description}
        onClose={handleClosePopover}
        onDescriptionChange={handleDescriptionChange}
      />
    </Box>
  );
};

export default TimesheetCell;
