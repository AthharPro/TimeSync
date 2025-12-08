import React from 'react';
import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BaseBtn } from '../../../atoms';
import { CreateTaskRowProps } from './../../../../interfaces/component/organism';

const CreateTaskRow: React.FC<CreateTaskRowProps> = ({ onCreateTask }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      pl: 3,
      py: 1
    }}>
      <BaseBtn
        variant="outlined"
        size="small" 
        onClick={onCreateTask}
        startIcon={<AddIcon />}
      >
        Create Task
      </BaseBtn>
    </Box>
  );
};

export default CreateTaskRow;
