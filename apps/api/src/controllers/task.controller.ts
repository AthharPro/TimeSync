import { catchErrors } from "../utils";
import { CREATED } from "../constants";
import { createTaskSchema } from "../schemas";
import { createTask } from "../services";
import { Request, Response } from "express";


export const createTaskHandler = catchErrors(async (req: Request, res: Response) => {
  const parsed = createTaskSchema.parse(req.body);
  const {projectId,taskName} = parsed;

  const params= {
    projectId, 
    taskName
  };
  
  const result = await createTask(params);
  return res.status(CREATED).json(result);
});