import { Timesheet } from '../models';
import { ITimesheetDocument } from '../interfaces';
import mongoose from 'mongoose';
import { createBulkNotifications } from './notification.service';
import { NotificationType } from '@tms/shared';
import { getSupervisorsForTimesheets } from '../utils/data/assignmentUtils';
import { UserModel } from '../models/user.model';
import ProjectModel from '../models/project.model';
import TeamModel from '../models/team.model';
import { Task } from '../models/task.model';
import { hasEditPermission } from './editRequest.service';
import dayjs from 'dayjs';

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

/**
 * Check if a timesheet entry date is allowed based on deadline rules
 * - Past months require supervisor approval via edit request
 */
const checkTimesheetDeadline = async (userId: string, entryDate: Date): Promise<void> => {
  const now = dayjs();
  const entry = dayjs(entryDate);
  
  // Get the month and year of the timesheet entry
  const entryMonth = entry.format('YYYY-MM');
  const entryYear = entry.format('YYYY');
  const entryMonthName = entry.format('MMMM YYYY');
  
  // If the entry is for the current month or future, allow it
  if (entry.isSame(now, 'month') || entry.isAfter(now, 'month')) {
    return;
  }
  
  // If the entry is for a past month - check if user has approval
  const hasPermission = await hasEditPermission(userId, entryMonth, entryYear);
  
  if (!hasPermission) {
    throw new Error(
      `Cannot create or edit timesheets for ${entryMonthName}. Please submit an edit request to your supervisor for approval.`
    );
  }
};

export const createMyTimesheet = async (
  params: CreateTimesheetParams
): Promise<ITimesheetDocument> => {
  // Check deadline before creating timesheet
  await checkTimesheetDeadline(params.userId, params.date);
  
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

  // Skip duplicate check - allow multiple entries for same project/task on same date
  // Users might want to log different time blocks or descriptions for the same task
  /*
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
  */

  const timesheet = new Timesheet(timesheetData);
  const savedTimesheet = await timesheet.save();
  
  // Populate the saved timesheet before returning (consistent with getMyTimesheets)
  const populatedTimesheet = await Timesheet.findById(savedTimesheet._id).lean();
  
  if (!populatedTimesheet) {
    return savedTimesheet;
  }
  
  // Manually populate and check if entities still exist
  // Populate project
  if (populatedTimesheet.projectId) {
    const projectData = await ProjectModel.findById(populatedTimesheet.projectId).select('projectName').lean();
    if (projectData) {
      (populatedTimesheet as any).projectId = {
        _id: populatedTimesheet.projectId,
        projectName: projectData.projectName
      };
    } else {
      (populatedTimesheet as any).projectId = {
        _id: populatedTimesheet.projectId,
        projectName: 'Deleted Project'
      };
    }
  }
  
  // Populate task
  if (populatedTimesheet.taskId) {
    const taskData = await Task.findById(populatedTimesheet.taskId).select('taskName').lean();
    if (taskData) {
      (populatedTimesheet as any).taskId = {
        _id: populatedTimesheet.taskId,
        taskName: taskData.taskName
      };
    } else {
      (populatedTimesheet as any).taskId = {
        _id: populatedTimesheet.taskId,
        taskName: 'Deleted Task'
      };
    }
  }
  
  // Populate team
  if (populatedTimesheet.teamId) {
    const teamData = await TeamModel.findById(populatedTimesheet.teamId).select('teamName').lean();
    if (teamData) {
      (populatedTimesheet as any).teamId = {
        _id: populatedTimesheet.teamId,
        teamName: teamData.teamName
      };
    } else {
      (populatedTimesheet as any).teamId = {
        _id: populatedTimesheet.teamId,
        teamName: 'Deleted Team'
      };
    }
  }
  
  return populatedTimesheet as any;
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
  
  // If date is being updated, check deadline for the new date
  if (date) {
    await checkTimesheetDeadline(userId, date);
  } else {
    // If date is not being updated, check deadline for existing date
    await checkTimesheetDeadline(userId, existingTimesheet.date);
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
  // Skip duplicate check - allow multiple entries for same project/task on same date
  // Users might want to log different time blocks or descriptions for the same task
  /*
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
  */

  const updatedTimesheet = await Timesheet.findByIdAndUpdate(
    new mongoose.Types.ObjectId(timesheetId),
    updateData,
    { new: true }
  ).lean();

  if (!updatedTimesheet) {
    return null;
  }
  
  // Manually populate and check if entities still exist (consistent with getMyTimesheets)
  // Populate project
  if (updatedTimesheet.projectId) {
    const projectData = await ProjectModel.findById(updatedTimesheet.projectId).select('projectName').lean();
    if (projectData) {
      (updatedTimesheet as any).projectId = {
        _id: updatedTimesheet.projectId,
        projectName: projectData.projectName
      };
    } else {
      (updatedTimesheet as any).projectId = {
        _id: updatedTimesheet.projectId,
        projectName: 'Deleted Project'
      };
    }
  }
  
  // Populate task
  if (updatedTimesheet.taskId) {
    const taskData = await Task.findById(updatedTimesheet.taskId).select('taskName').lean();
    if (taskData) {
      (updatedTimesheet as any).taskId = {
        _id: updatedTimesheet.taskId,
        taskName: taskData.taskName
      };
    } else {
      (updatedTimesheet as any).taskId = {
        _id: updatedTimesheet.taskId,
        taskName: 'Deleted Task'
      };
    }
  }
  
  // Populate team
  if (updatedTimesheet.teamId) {
    const teamData = await TeamModel.findById(updatedTimesheet.teamId).select('teamName').lean();
    if (teamData) {
      (updatedTimesheet as any).teamId = {
        _id: updatedTimesheet.teamId,
        teamName: teamData.teamName
      };
    } else {
      (updatedTimesheet as any).teamId = {
        _id: updatedTimesheet.teamId,
        teamName: 'Deleted Team'
      };
    }
  }
  
  return updatedTimesheet as any;
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
      // Ensure we start at the beginning of the day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    if (endDate) {
      // Set to end of day to include all entries on the last day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  // Fetch timesheets WITHOUT population first
  const rawTimesheets = await Timesheet.find(query).sort({ date: 1 }).lean();

  if (rawTimesheets.length > 0) {
  }

  // Manually populate and check if entities still exist
  const enrichedTimesheets = await Promise.all(
    rawTimesheets.map(async (ts: any) => {
      // Populate project (fetch from database even if user no longer has access)
      if (ts.projectId) {
        const projectData = await ProjectModel.findById(ts.projectId).select('projectName').lean();
        if (projectData) {
          ts.projectId = {
            _id: ts.projectId,
            projectName: projectData.projectName
          };
        } else {
          // Project was completely deleted from database
          ts.projectId = {
            _id: ts.projectId,
            projectName: 'Deleted Project'
          };
        }
      }
      
      // Populate task (fetch from database even if user no longer has access)
      if (ts.taskId) {
        const taskData = await Task.findById(ts.taskId).select('taskName').lean();
        if (taskData) {
          ts.taskId = {
            _id: ts.taskId,
            taskName: taskData.taskName
          };
        } else {
          // Task was completely deleted from database
          ts.taskId = {
            _id: ts.taskId,
            taskName: 'Deleted Task'
          };
        }
      }
      
      // Populate team (fetch from database even if user no longer has access)
      if (ts.teamId) {
        const teamData = await TeamModel.findById(ts.teamId).select('teamName').lean();
        if (teamData) {
          ts.teamId = {
            _id: ts.teamId,
            teamName: teamData.teamName
          };
        } else {
          // Team was completely deleted from database
          ts.teamId = {
            _id: ts.teamId,
            teamName: 'Deleted Team'
          };
        }
      }
      
      return ts;
    })
  );

  return enrichedTimesheets as any;
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

  // Send notifications to supervisors based on the actual timesheets being submitted
  try {
    // Get supervisors from the specific projects and teams in these timesheets
    const supervisorIds = await getSupervisorsForTimesheets(timesheets);
    
    // Remove the submitter from the list of notification recipients
    const filteredSupervisorIds = supervisorIds.filter(id => id !== userId);
    
    if (filteredSupervisorIds.length > 0) {
      // Get employee info for the notification message
      const employee = await UserModel.findById(userId).select('firstName lastName').lean();
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'An employee';
      
      await createBulkNotifications(filteredSupervisorIds, {
        type: NotificationType.TimesheetSubmitted,
        title: 'New Timesheet Submission',
        message: `${employeeName} has submitted ${timesheetIds.length} timesheet(s) for review`,
        relatedId: userId,
        relatedModel: 'User',
      });
    }
  } catch (error) {
    // Don't fail the submission if notification fails
  }

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
