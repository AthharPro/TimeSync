export interface ActionButtonProps {
  onEdit?: () => void;
  onDelete?: () => void;
  disableEdit?: boolean;
  showDelete?: boolean;
  disableDelete?: boolean;
  deleteLabel?: string;
}