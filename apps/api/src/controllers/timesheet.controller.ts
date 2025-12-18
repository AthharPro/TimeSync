import { catchErrors } from "../utils";
import { CREATED, OK } from "../constants";
import { createTimesheetSchema, updateTimesheetSchema, getTimesheetsSchema } from "../schemas";
import { Request, Response } from "express";
import { createMyTimesheet, updateMyTimesheet, getMyTimesheets, submitTimesheets, deleteTimesheets } from "../services";
import { BillableType } from "@tms/shared";

export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createTimesheetSchema.parse(req.body);
  const { date, projectId, taskId, billable, description, hours } = parsed;

  // Pass as strings; conversion to ObjectId happens in the service
  const params = {
    userId,
    date,
    projectId,
    taskId,
    billable: billable || BillableType.NonBillable,
    description: description || "",
    hours: hours || 0.0
  };

  console.log("createMyTimesheetHandler - params:", params);

  const result = await createMyTimesheet(params);

  console.log("createMyTimesheetHandler - result:", result);
  return res.status(CREATED).json(result);
});

export const updateMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const timesheetId = req.params.id;
  const parsed = updateTimesheetSchema.parse(req.body);

  const params = {
    timesheetId,
    userId,
    ...parsed,
  };

  console.log("updateMyTimesheetHandler - params:", params);

  const result = await updateMyTimesheet(params);

  if (!result) {
    return res.status(404).json({ message: 'Timesheet not found' });
  }

  console.log("updateMyTimesheetHandler - result:", result);
  return res.status(OK).json(result);
});

export const getMyTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  
  // Parse query parameters for date range
  const parsed = getTimesheetsSchema.parse(req.query);
  const { startDate, endDate } = parsed;

  console.log("getMyTimesheetsHandler - params:", { userId, startDate, endDate });

  const timesheets = await getMyTimesheets(userId, startDate, endDate);

  console.log("getMyTimesheetsHandler - found timesheets:", timesheets.length);
  return res.status(OK).json(timesheets);
});

export const submitTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { timesheetIds } = req.body;

  if (!Array.isArray(timesheetIds) || timesheetIds.length === 0) {
    return res.status(400).json({ message: 'timesheetIds must be a non-empty array' });
  }

  console.log("submitTimesheetsHandler - params:", { userId, timesheetIds });

  const result = await submitTimesheets(userId, timesheetIds);

  console.log("submitTimesheetsHandler - result:", result);
  return res.status(OK).json(result);
});

export const deleteTimesheetsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { timesheetIds } = req.body;

  if (!Array.isArray(timesheetIds) || timesheetIds.length === 0) {
    return res.status(400).json({ message: 'timesheetIds must be a non-empty array' });
  }

  console.log("deleteTimesheetsHandler - params:", { userId, timesheetIds });

  const result = await deleteTimesheets(userId, timesheetIds);

  console.log("deleteTimesheetsHandler - result:", result);
  return res.status(OK).json(result);
});
