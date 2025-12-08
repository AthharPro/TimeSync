import { Timesheet } from '../models';
import { ITimesheetDocument } from '../interfaces';
import { appAssert } from '../utils';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants';
import mongoose from 'mongoose';

interface CreateTimesheetParams {
  date: Date;
  userId: string;
  projectId: string;
  taskId: string;
  billable?: string;
  description?: string;
  hours: number;
}

export const createMyTimesheet = async (
  params: CreateTimesheetParams
): Promise<ITimesheetDocument> => {
  const timesheet = new Timesheet({
    date: params.date,
    userId: new mongoose.Types.ObjectId(params.userId),
    projectId: new mongoose.Types.ObjectId(params.projectId),
    taskId: new mongoose.Types.ObjectId(params.taskId),
    billable: params.billable,
    description: params.description,
    hours: params.hours || 0,
  });

  return await timesheet.save();
};

export const updateTimesheet = async (
  params: Partial<ITimesheetDocument> & { _id: string }
): Promise<ITimesheetDocument | null> => {
  const timesheet = await Timesheet.findById(params._id);
  appAssert(timesheet, NOT_FOUND, 'Timesheet not found');
  // Update only the fields that are present in params
  Object.assign(timesheet, params);

  const result = await timesheet.save();
  appAssert(result, INTERNAL_SERVER_ERROR, 'Timesheet update failed');

  return result;
};
