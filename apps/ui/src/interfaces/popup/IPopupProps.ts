import { UserRole } from '@tms/shared';
export interface CreateAccountPopupProps {
  open: boolean;
  role: UserRole;
  onClose: () => void;
  onSuccess?: () => void;
}