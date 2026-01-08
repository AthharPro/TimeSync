import { IAccountTableRow } from "../component/organism/ITable";
import { UserRole } from "@tms/shared";

export interface IUseAccountReturn{
//states
fetchAccountDetails: IAccountTableRow[];
newAccountDetails: IAccountTableRow[];
isLoading: boolean;
error: string | null;

//actions
addNewAccountDetails: (account: IAccountTableRow) => void;
updateAccountDetails: (id: string, updates: Partial<IAccountTableRow>) => void;
loadAccounts: () => Promise<void>;
createAccount: (data: {
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  contactNumber: string;
}, role: UserRole) => Promise<void>;
updateAccount: (userId: string, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  designation?: string;
  contactNumber?: string;
  status?: 'Active' | 'Inactive' | string;
}) => Promise<void>;
} 