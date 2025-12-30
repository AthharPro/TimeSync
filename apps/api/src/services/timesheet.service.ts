import { Timesheet } from '../models';
import { ITimesheetDocument } from '../interfaces';
import mongoose from 'mongoose';

interface CreateTimesheetParams {
  date: Date;
  userId: string;
  projectId?: string;
  taskId?: string;
  teamId?: string;
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
  teamId?: string;
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

  // Only add teamId if it's a valid, non-empty string
  if (params.teamId && mongoose.Types.ObjectId.isValid(params.teamId)) {
    timesheetData.teamId = new mongoose.Types.ObjectId(params.teamId);
  } else {
    timesheetData.teamId = null;
  }

  // Check for duplicate project+task on same date (only if both projectId and taskId are set)
  if (timesheetData.projectId && timesheetData.taskId) {
    const startOfDay = new Date(params.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(params.date);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicate = await Timesheet.findOne({
      userId: timesheetData.userId,
      projectId: timesheetData.projectId,
      taskId: timesheetData.taskId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (duplicate) {
      throw new Error('A timesheet entry with this project and task already exists for this date');
    }
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

    if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
      updateData.taskId = new mongoose.Types.ObjectId(taskId);
    } else {
      updateData.taskId = null;
    }
  }

  // Only update teamId if it's a valid, non-empty string
  if (params.teamId !== undefined) {
    if (params.teamId && mongoose.Types.ObjectId.isValid(params.teamId)) {
      updateData.teamId = new mongoose.Types.ObjectId(params.teamId);
    } else {
      updateData.teamId = null;
    }
  }

  // Check for duplicate project+task on same date (only if updating project or task)
  const finalProjectId = updateData.projectId !== undefined ? updateData.projectId : existingTimesheet.projectId;
  const finalTaskId = updateData.taskId !== undefined ? updateData.taskId : existingTimesheet.taskId;
  const finalDate = updateData.date !== undefined ? updateData.date : existingTimesheet.date;

  if (finalProjectId && finalTaskId && (projectId !== undefined || taskId !== undefined || date !== undefined)) {
    const startOfDay = new Date(finalDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(finalDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicate = await Timesheet.findOne({
      _id: { $ne: new mongoose.Types.ObjectId(timesheetId) }, // Exclude current timesheet
      userId: new mongoose.Types.ObjectId(userId),
      projectId: finalProjectId,
      taskId: finalTaskId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (duplicate) {
      throw new Error('A timesheet entry with this project and task already exists for this date');
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
      // Set to end of day to include all entries on the last day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
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
