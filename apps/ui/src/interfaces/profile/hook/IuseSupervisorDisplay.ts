import { UserRole } from '@tms/shared';


export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface UseSupervisorDisplayProps {
  user: User | null;
  open: boolean;
}