import { useDispatch, useSelector } from 'react-redux';
import { IUseAccountReturn } from '../../interfaces/hook';
import { useCallback } from 'react';
import { IAccountTableRow } from '../../interfaces/component/organism/ITable';
import { setAccountData, updateAccountById, fetchAccounts } from '../../store/slices/AccountSlice';
import { RootState, AppDispatch } from '../../store/store';

export const useAccount = (): IUseAccountReturn => {
    const dispatch = useDispatch<AppDispatch>();
    const newAccountDetails = useSelector((state: RootState) => state.account.accountData);
    
    // Placeholder states 
    const fetchAccountDetails: IAccountTableRow[] = [];
    const isLoading = false;
    const error: string | null = null;

    const addNewAccountDetails = useCallback((account: IAccountTableRow) => {
        dispatch(setAccountData(account));
    }, [dispatch]);

    const updateAccountDetails = useCallback((id: string, updates: Partial<IAccountTableRow>) => {
        dispatch(updateAccountById({ id, updates }));
    }, [dispatch]);

    // Load accounts from database
    const loadAccounts = useCallback(
        async () => {
            try {
                // Dispatch action to fetch accounts from API
                await dispatch(fetchAccounts());
            } catch (error) {
                console.error('Load accounts error:', error);
            }
        },
        [dispatch]
    );

    return {
        fetchAccountDetails,
        newAccountDetails,
        isLoading,
        error,
        addNewAccountDetails,
        updateAccountDetails,
        loadAccounts,
    };
}