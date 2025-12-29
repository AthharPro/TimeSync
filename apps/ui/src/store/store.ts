import { configureStore, combineReducers, UnknownAction } from "@reduxjs/toolkit";
import myTimesheets from "./slices/myTimesheetSlice";
import account from "./slices/AccountSlice";
import projectReducer from "./slices/projectSlice";
import taskReducer from "./slices/taskSlice";
import teamReducer from "./slices/teamSlice";
import reportReducer from "./slices/reportSlice";
import reviewTimesheetReducer from "./slices/reviewTimesheetSlice";
import authReducer from "./slices/authSlice";

const appReducer = combineReducers({
    myTimesheet: myTimesheets,
    account: account,
    project: projectReducer,
    tasks: taskReducer,
    team: teamReducer,
    report: reportReducer,
    reviewTimesheet: reviewTimesheetReducer,
    auth: authReducer,
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