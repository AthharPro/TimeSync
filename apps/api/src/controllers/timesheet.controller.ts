import { catchErrors } from "../utils";
import { CREATED, OK } from "../constants";
import { createTimesheetSchema } from "../schemas";
import { Request, Response } from "express";
import { createMyTimesheet } from "../services";

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
