import { Timesheet } from '../models';
import { ITimesheetDocument } from '../interfaces';
import mongoose from 'mongoose';

interface CreateTimesheetParams {
  date: Date;
  userId: string;
  projectId?: string;
  taskId?: string;
  billable?: string;
  description?: string;
  hours: number;
}

interface UpdateTimesheetParams {
  timesheetId: string;
  userId: string;
  date?: Date;
  projectId?: string;
  taskId?: string;
  billable?: string;
  description?: string;
  hours?: number;
}

export const createMyTimesheet = async (
  params: CreateTimesheetParams
): Promise<ITimesheetDocument> => {
  const timesheetData: any = {
    date: params.date,
    userId: new mongoose.Types.ObjectId(params.userId),
    billable: params.billable,
    description: params.description || '',
    hours: params.hours || 0,
  };

  // Only add projectId if it's a valid, non-empty string
  if (params.projectId && mongoose.Types.ObjectId.isValid(params.projectId)) {
    timesheetData.projectId = new mongoose.Types.ObjectId(params.projectId);
  } else {
    timesheetData.projectId = null; // explicit null
  }

  // Only add taskId if it's a valid, non-empty string
  if (params.taskId && mongoose.Types.ObjectId.isValid(params.taskId)) {
    timesheetData.taskId = new mongoose.Types.ObjectId(params.taskId);
  } else {
    timesheetData.taskId = null;
  }

  const timesheet = new Timesheet(timesheetData);
  return await timesheet.save();
};

export const updateMyTimesheet = async (
  params: UpdateTimesheetParams
): Promise<ITimesheetDocument | null> => {
  const { timesheetId, userId, date, projectId, taskId, billable, description, hours } = params;

  // Verify the timesheet exists and belongs to the user
  const existingTimesheet = await Timesheet.findOne({
    _id: new mongoose.Types.ObjectId(timesheetId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!existingTimesheet) {
    return null;
  }

  // Only allow updating Draft timesheets
  const isDraft = existingTimesheet.status === 'Draft' || existingTimesheet.status === '' || existingTimesheet.status === 'Default';
  
  if (!isDraft) {
    throw new Error('Only Draft timesheets can be modified. This timesheet has been submitted and cannot be edited.');
  }

  const updateData: any = {};

  if (date !== undefined) updateData.date = date;
  if (billable !== undefined) updateData.billable = billable;
  if (description !== undefined) updateData.description = description;
  if (hours !== undefined) updateData.hours = hours;

  // Only update projectId if it's a valid, non-empty string
  if (projectId !== undefined) {
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      updateData.projectId = new mongoose.Types.ObjectId(projectId);
    } else {
      updateData.projectId = null;
    }
  }

  // Only update taskId if it's a valid, non-empty string (and only for Draft)
  if (taskId !== undefined) {
    if (isDraft) {
      if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
        updateData.taskId = new mongoose.Types.ObjectId(taskId);
      } else {
        updateData.taskId = null;
      }
    }
  }

  const updatedTimesheet = await Timesheet.findByIdAndUpdate(
    new mongoose.Types.ObjectId(timesheetId),
    updateData,
    { new: true }
  );

  return updatedTimesheet;
};

export const getMyTimesheets = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ITimesheetDocument[]> => {
  const query: any = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  // If date range is provided, filter by it
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = startDate;
    }
    if (endDate) {
      query.date.$lte = endDate;
    }
  }

  const timesheets = await Timesheet.find(query).sort({ date: 1 });
  return timesheets;
};

export const submitTimesheets = async (
  userId: string,
  timesheetIds: string[]
): Promise<{ updated: number; timesheets: ITimesheetDocument[] }> => {
  // Verify all timesheets exist and belong to the user
  const timesheets = await Timesheet.find({
    _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) },
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (timesheets.length === 0) {
    throw new Error('No timesheets found');
  }

  // Update all timesheets to Pending status
  const result = await Timesheet.updateMany(
    {
      _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId),
    },
    {
      $set: { status: 'Pending' }
    }
  );

  // Fetch updated timesheets
  const updatedTimesheets = await Timesheet.find({
    _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) },
  });

  return {
    updated: result.modifiedCount,
    timesheets: updatedTimesheets,
  };
};
export const deleteTimesheets = async (
  userId: string,
  timesheetIds: string[]
): Promise<{ deleted: number }> => {
  // Only delete timesheets that belong to the user and are in draft status
  const result = await Timesheet.deleteMany({
    _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) },
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: ['', 'Default', 'Draft'] }, // Only delete draft timesheets
  });

  return {
    deleted: result.deletedCount,
  };
};
