export interface DescriptionPopoverProps {
  anchorEl: HTMLElement | null;
  description: string;
  onClose: () => void;
  onDescriptionChange: (newDescription: string) => void;
}