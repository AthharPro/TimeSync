import { useDispatch, useSelector } from 'react-redux';
import { IUseAccountReturn } from '../../interfaces/hook';
import { useCallback } from 'react';
import { IAccountTableRow } from '../../interfaces/component/organism/ITable';
import { setAccountData, updateAccountById, fetchAccounts } from '../../store/slices/AccountSlice';
import { RootState, AppDispatch } from '../../store/store';
import { registerUser } from '../../api/auth';
import { updateUser } from '../../api/user';
import { UserRole } from '@tms/shared';

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

    // Create a new account
    const createAccount = useCallback(
        async (
            data: {
                email: string;
                firstName: string;
                lastName: string;
                designation: string;
                contactNumber: string;
            },
            role: UserRole
        ) => {
            try {
                await registerUser(data, role);
                // Reload accounts after successful creation
                await dispatch(fetchAccounts());
            } catch (error) {
                console.error('Create account error:', error);
                throw error;
            }
        },
        [dispatch]
    );

    // Update an existing account
    const updateAccount = useCallback(
        async (
            userId: string,
            data: {
                firstName?: string;
                lastName?: string;
                email?: string;
                designation?: string;
                contactNumber?: string;
                status?: 'Active' | 'Inactive' | string;
            }
        ) => {
            try {
                // Convert status to boolean for backend
                const updateData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    designation: data.designation,
                    contactNumber: data.contactNumber,
                    status: data.status === 'Active',
                };
                
                await updateUser(userId, updateData);
                // Reload accounts after successful update
                await dispatch(fetchAccounts());
            } catch (error) {
                console.error('Update account error:', error);
                throw error;
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
        createAccount,
        updateAccount,
    };
}