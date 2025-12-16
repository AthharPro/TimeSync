import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ActionButtonProps } from '../../../interfaces/other/IActionButton';
export default function ActionButton({
  onEdit,
  onDelete,
  disableEdit = false,
  showDelete = true,
  disableDelete = false,
}: ActionButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
    handleClose();
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
    handleClose();
  };

  return (
    <div>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleEdit} disabled={disableEdit}>
          Edit
        </MenuItem>
        {showDelete && (
          <MenuItem onClick={handleDelete} disabled={disableDelete}>
            Delete
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
