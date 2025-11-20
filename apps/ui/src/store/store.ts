import { configureStore, combineReducers, UnknownAction } from "@reduxjs/toolkit";
import myTimesheets from "./slices/myTimesheetSlice";
import account from "./slices/AccountSlice";

const appReducer = combineReducers({
    myTimesheet: myTimesheets,
    account: account,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer    
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;