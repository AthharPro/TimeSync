import React from 'react';
import { Box } from '@mui/material';
import { BillableType } from '@tms/shared';
import AutocompleteWithCreate from '../../../atoms/other/inputField/AutocompleteWithCreate';
import Dropdown from '../../../atoms/other/inputField/Dropdown';
import { TaskRowProps } from './../../../../interfaces/component/organism';

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  billableType,
  rowId,
  projectId,
  availableTasks,
  onTaskChange,
  onBillableTypeChange,
  onCreateNewTask,
}) => {
  const handleCreateTask = async (taskName: string) => {
    if (onCreateNewTask && projectId) {
      await onCreateNewTask(projectId, taskName);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3 }}>
      <Box sx={{ flex: 1 }}>
        <AutocompleteWithCreate
          value={task}
          onChange={(_, newValue) => onTaskChange(rowId, newValue)}
          options={availableTasks}
          placeholder="Enter Task"
          onCreateNew={onCreateNewTask ? handleCreateTask : undefined}
          disabled={!projectId}
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
