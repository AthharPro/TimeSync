import { configureStore, combineReducers } from "@reduxjs/toolkit";
import myTimesheets from "./slices/myTimesheetSlice";

const appReducer = combineReducers({
    myTimesheet: myTimesheets,
});

const rootReducer = (state: any, action: any) => {
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer    
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;