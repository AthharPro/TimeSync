export interface IActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  disableEdit?: boolean;
  showDelete?: boolean;
  disableDelete?: boolean;
}