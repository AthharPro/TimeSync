import { IAccountTableRow } from "../component/organism/ITable";

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
} 