import { UserRole } from '../enums';

export interface User {
  _id?: string;
  employee_id: string;
  firstName: string;
  lastName: string;
  designation: string;
  contactNumber: string;
  teams?: string[];
  role: UserRole;
  status: boolean;
  email: string;
  isChangedPwd: boolean;
  password?:string;
}
