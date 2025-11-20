import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAccountState } from "../../interfaces";
import { IAccountTableEntry } from "../../interfaces/layout";

const initialState: IAccountState = {
  accountData: [],
};

const AccountSlice  = createSlice({
    name: "account",
    initialState,
    reducers: {
        setAccountData: (state, action: PayloadAction<IAccountTableEntry>) => {
            state.accountData.push(action.payload);
        },
        updateAccountEntry: (state, action: PayloadAction<{ index: number; updates: Partial<IAccountTableEntry> }>) => {
            const { index, updates } = action.payload;
            if (state.accountData[index]) {
                state.accountData[index] = { ...state.accountData[index], ...updates };
            }
        },
        updateAccountById: (state, action: PayloadAction<{ id: string; updates: Partial<IAccountTableEntry> }>) => {
            const { id, updates } = action.payload;
            const index = state.accountData.findIndex(entry => entry.id === id);
            if (index !== -1) {
                state.accountData[index] = { ...state.accountData[index], ...updates };
            }
        }
    },
});

export default AccountSlice.reducer;
export const { setAccountData, updateAccountEntry, updateAccountById } = AccountSlice.actions;


