import { UserRole } from '@tms/shared';
import { IEmployee } from '../user/IUser';

export interface CreateAccountPopupProps {
  open: boolean;
  role: UserRole;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface AddEmployeePopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedEmployees: IEmployee[]) => void;
  initialSelectedEmployees?: IEmployee[];
  roles?: UserRole[];
}