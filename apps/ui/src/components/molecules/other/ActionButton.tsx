import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { IActionButtonsProps } from "../../../interfaces/component/molecules/IActionButtonsProps";

const ActionButton: React.FC<IActionButtonsProps> = ({ onEdit, onDelete, disabled, disableEdit, showDelete = true, disableDelete }) => (
  <>
    <IconButton onClick={onEdit} color="primary" disabled={disableEdit ?? disabled}>
      <EditIcon />
    </IconButton>
    {showDelete && (
      <IconButton onClick={onDelete} color="error" disabled={disableDelete ?? disabled}>
        <DeleteIcon />
      </IconButton>
    )}
  </>
);

export default ActionButton;
