import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IAccountState } from "../../interfaces";
import { IAccountTableRow } from "../../interfaces/component/organism/ITable";
import { getUsers } from "../../api/user";

// Async thunk for fetching accounts from the backend
export const fetchAccounts = createAsyncThunk(
  'account/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const users = await getUsers();
      return users;
    } catch (error: any) {
      console.error('fetchAccounts - Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch accounts');
    }
  }
);

const initialState: IAccountState = {
  accountData: [],
};

const AccountSlice  = createSlice({
    name: "account",
    initialState,
    reducers: {
        setAllAccounts: (state, action: PayloadAction<IAccountTableRow[]>) => {
            // Replace all accounts with the new data
            state.accountData = action.payload;
        },
        setAccountData: (state, action: PayloadAction<IAccountTableRow>) => {
            state.accountData.push(action.payload);
        },
        updateAccountEntry: (state, action: PayloadAction<{ index: number; updates: Partial<IAccountTableRow> }>) => {
            const { index, updates } = action.payload;
            if (state.accountData[index]) {
                state.accountData[index] = { ...state.accountData[index], ...updates };
            }
        },
        updateAccountById: (state, action: PayloadAction<{ id: string; updates: Partial<IAccountTableRow> }>) => {
            const { id, updates } = action.payload;
            const index = state.accountData.findIndex(entry => entry.id === id);
            if (index !== -1) {
                state.accountData[index] = { ...state.accountData[index], ...updates };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch accounts
            .addCase(fetchAccounts.pending, (state) => {
                console.log('fetchAccounts.pending');
            })
            .addCase(fetchAccounts.fulfilled, (state, action) => {
                // Map backend response to frontend format
                const mappedAccounts: IAccountTableRow[] = action.payload.map((user: any) => ({
                    id: user._id || user.id,
                    employee_id: user.employee_id || '',
                    email: user.email || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    role: user.role || '',
                    designation: user.designation || '',
                    contactNumber: user.contactNumber || '',
                    createdAt: user.createdAt || '',
                    status: user.status !== undefined ? (user.status ? 'Active' : 'Inactive') : 'Active',
                }));

                // Replace the existing accounts with fetched data
                state.accountData = mappedAccounts;
            })
            .addCase(fetchAccounts.rejected, (state, action) => {
                console.error('fetchAccounts.rejected - Error:', action.payload);
            });
    },
});

export default AccountSlice.reducer;
export const { setAllAccounts, setAccountData, updateAccountEntry, updateAccountById } = AccountSlice.actions;


