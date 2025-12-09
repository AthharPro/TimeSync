export interface IProfilePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}