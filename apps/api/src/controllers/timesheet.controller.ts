import { catchErrors } from "../utils";
import { CREATED, OK } from "../constants";
import { createTimesheetSchema,updateTimesheetSchema } from "../schemas";
import { createMyTimesheet,updateTimesheet } from "../services";
import { Request, Response } from "express";

export const createMyTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createTimesheetSchema.parse(req.body);
  const {date,projectId,taskId,billable,description,hours} = parsed;

  // Pass as strings; conversion to ObjectId happens in the service
  const params= {
    date,
    userId,
    projectId,
    taskId,
    billable,
    description,
    hours
  };
  
  const result = await createMyTimesheet(params);
  return res.status(CREATED).json(result);
});

export const updateTimesheetHandler = catchErrors(async (req: Request, res: Response) => {
  const timesheetId = req.params.id;
  const parsed = updateTimesheetSchema.parse(req.body);
  const {projectId,taskId,billable,description,hours} = parsed;

  // Build params object with only provided fields (conversion to ObjectId happens in service)
  const params: Record<string, unknown> = {
    _id: timesheetId,
  };
  
  if (projectId) params.projectId = projectId;
  if (taskId) params.taskId = taskId;
  if (billable) params.billable = billable;
  if (description) params.description = description;
  if (hours) params.hours = hours;

  const result = await updateTimesheet(params);
  return res.status(OK).json(result);
});