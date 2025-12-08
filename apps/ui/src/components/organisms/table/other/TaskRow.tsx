import React from 'react';
import { Box } from '@mui/material';
import { BillableType } from '@tms/shared';
import AutocompleteText from '../../../atoms/other/inputField/Autocomplete';
import Dropdown from '../../../atoms/other/inputField/Dropdown';
import { TaskRowProps } from './../../../../interfaces/component/organism';

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  billableType,
  rowId,
  availableTasks,
  onTaskChange,
  onBillableTypeChange,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3 }}>
      <Box sx={{ flex: 1 }}>
        <AutocompleteText
          value={task}
          onChange={(_, newValue) => onTaskChange(rowId, newValue)}
          options={availableTasks}
          placeholder="Enter Task"
        />
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <Dropdown
          value={billableType}
          onChange={(newBillableType) =>
            onBillableTypeChange(rowId, newBillableType)
          }
          options={BillableType}
          onClick={(e) => e.stopPropagation()}
          sx={{ minWidth: '115px' }}
        />
      </Box>
    </Box>
  );
};

export default TaskRow;
