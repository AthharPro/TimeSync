import { IAccountTableEntry } from "../layout";

export interface IUseAccountReturn{
//states
fetchAccountDetails: IAccountTableEntry[];
newAccountDetails: IAccountTableEntry[];
isLoading: boolean;
error: string | null;

//actions
addNewAccountDetails: (account: IAccountTableEntry) => void;
updateAccountDetails: (id: string, updates: Partial<IAccountTableEntry>) => void;
} 