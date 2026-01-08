import { catchErrors } from "../utils";
import { CREATED, OK } from "../constants";
import { createEditRequestSchema, approveEditRequestSchema, rejectEditRequestSchema, getEditRequestsSchema } from "../schemas";
import { Request, Response } from "express";
import { 
  createEditRequest, 
  getMyEditRequests, 
  getSupervisedEditRequests, 
  approveEditRequest, 
  rejectEditRequest,
  hasEditPermission
} from "../services";

export const createEditRequestHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = createEditRequestSchema.parse(req.body);

  const { month, year } = parsed;

  const params = {
    userId,
    month,
    year
  };


  const result = await createEditRequest(params);

  return res.status(CREATED).json(result);
});

export const getMyEditRequestsHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const parsed = getEditRequestsSchema.parse(req.query);


  const editRequests = await getMyEditRequests(userId, parsed);

  return res.status(OK).json(editRequests);
});

export const getSupervisedEditRequestsHandler = catchErrors(async (req: Request, res: Response) => {
  const supervisorId = req.userId as string;
  const parsed = getEditRequestsSchema.parse(req.query);


  const editRequests = await getSupervisedEditRequests(supervisorId, parsed);

  return res.status(OK).json(editRequests);
});

export const approveEditRequestHandler = catchErrors(async (req: Request, res: Response) => {
  const approvedBy = req.userId as string;
  const parsed = approveEditRequestSchema.parse(req.body);

  const params = {
    requestId: parsed.requestId,
    approvedBy
  };


  const result = await approveEditRequest(params);

  return res.status(OK).json(result);
});

export const rejectEditRequestHandler = catchErrors(async (req: Request, res: Response) => {
  const rejectedBy = req.userId as string;
  const parsed = rejectEditRequestSchema.parse(req.body);

  const params = {
    requestId: parsed.requestId,
    rejectedBy,
    rejectionReason: parsed.rejectionReason
  };


  const result = await rejectEditRequest(params);

  return res.status(OK).json(result);
});

export const checkEditPermissionHandler = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required' });
  }


  const hasPermission = await hasEditPermission(userId, month as string, year as string);

  return res.status(OK).json({ hasPermission });
});
