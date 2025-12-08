import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IProjectActionButtonsProps } from '../../../interfaces/project/IProjectCells';

const ProjectActionButtons: React.FC<IProjectActionButtonsProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(project.id);
  };

  return (
    <Box display="flex" gap={1}>
      <Tooltip title="Edit Project">
        <IconButton
          size="small"
          color="primary"
          onClick={handleEdit}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Project">
        <IconButton
          size="small"
          color="error"
          onClick={handleDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProjectActionButtons;
