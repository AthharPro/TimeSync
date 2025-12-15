import { UserRole } from '@tms/shared';

export interface ProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  designation?: string;
}