import { useDispatch, useSelector } from 'react-redux';
import { IUseAccountReturn } from '../../interfaces/hook';
import { useCallback } from 'react';
import { IAccountTableEntry } from '../../interfaces';
import { setAccountData ,updateAccountById} from '../../store/slices/AccountSlice';
import { RootState } from '../../store/store';

export const useAccount = (): IUseAccountReturn => {
    const dispatch = useDispatch();
    const newAccountDetails = useSelector((state: RootState) => state.account.accountData);
    
    // Placeholder states 
    const fetchAccountDetails: IAccountTableEntry[] = [];
    const isLoading = false;
    const error: string | null = null;

    const addNewAccountDetails = useCallback((account:IAccountTableEntry) => {
        dispatch(setAccountData(account));
    }, [dispatch]);

    const updateAccountDetails = useCallback((id: string, updates: Partial<IAccountTableEntry>) => {
        dispatch(updateAccountById({ id, updates }));
    }, [dispatch]);


    return {
        fetchAccountDetails,
        newAccountDetails,
        isLoading,
        error,
        addNewAccountDetails,
        updateAccountDetails,
    };
}