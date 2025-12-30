import { RequestHandler } from 'express';
import { UserModel } from '../models/user.model';
import { Timesheet } from '../models/timesheet.model';
import { TimesheetRejection } from '../models/rejectionReason.model';
import appAssert from '../utils/validation/appAssert';
import { FORBIDDEN, NOT_FOUND } from '../constants/http';
import { UserRole, DailyTimesheetStatus } from '@tms/shared';
import { getSupervisedUserIds } from '../utils/data/assignmentUtils';
import mongoose from 'mongoose';

/**
 * Get employees that the supervisor can review timesheets for
 * This includes employees from:
 * 1. Projects where the supervisor is assigned
 * 2. Teams where the supervisor is assigned (both department and non-department)
 */
export const getSupervisedEmployeesForReviewHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  
  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied. Only supervisors can review timesheets.'
  );

  try {
    let employees;
    
    if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin) {
      // Admin, SupervisorAdmin, and SuperAdmin can see all users except SuperAdmin
      employees = await UserModel.find({ 
        role: { $in: [UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin] }
      })
        .select('_id employee_id firstName lastName email designation')
        .sort({ firstName: 1, lastName: 1 })
        .lean();
    } else {
      // Regular Supervisor can only see their supervised employees
      // Get employee IDs from projects and teams where this supervisor is assigned
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      
      // Filter out the supervisor's own ID
      const employeeIds = supervisedUserIds.filter(id => id !== supervisorId);
      
      if (employeeIds.length === 0) {
        return res.json({ employees: [] });
      }
      
      employees = await UserModel.find({ 
        _id: { $in: employeeIds },
        status: true 
      })
        .select('_id employee_id firstName lastName email designation')
        .sort({ firstName: 1, lastName: 1 })
        .lean();
    }
    
    res.json({ employees });
  } catch (error) {
    console.error('Error fetching supervised employees for review:', error);
    res.status(500).json({ 
      message: 'Failed to fetch supervised employees',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get timesheets for a specific employee that the supervisor can review
 * Validates that the supervisor has permission to view the employee's timesheets
 */
export const getEmployeeTimesheetsForReviewHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied. Only supervisors can review timesheets.'
  );

  try {
    // Verify the supervisor has permission to view this employee's timesheets
    let hasPermission = false;

    if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin) {
      // Admins can view all employees
      hasPermission = true;
    } else {
      // Regular supervisors can only view their supervised employees
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      hasPermission = supervisedUserIds.includes(employeeId);
    }

    appAssert(
      hasPermission,
      FORBIDDEN,
      'You do not have permission to view this employee\'s timesheets'
    );

    // Verify employee exists
    const employee = await UserModel.findById(employeeId).select('_id firstName lastName');
    appAssert(employee, NOT_FOUND, 'Employee not found');

    // Build query for timesheets
    const query: any = {
      userId: new mongoose.Types.ObjectId(employeeId),
      status: { $ne: DailyTimesheetStatus.Draft }, // Exclude draft timesheets
    };

    // Add date filters if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        // Set to end of day to include all entries on the last day
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Fetch timesheets with populated project and task data
    const timesheets = await Timesheet.find(query)
      .populate('projectId', 'projectName')
      .populate('taskId', 'taskName')
      .sort({ date: -1 })
      .lean();

    // Get rejection reasons for rejected timesheets
    const timesheetIds = timesheets.map(ts => ts._id);
    const rejectionRecords = await TimesheetRejection.find({
      timesheetId: { $in: timesheetIds }
    })
      .populate('rejectedBy', 'firstName lastName')
      .sort({ rejectedAt: -1 })
      .lean();

    // Create a map of timesheet ID to latest rejection reason
    const rejectionMap = new Map();
    rejectionRecords.forEach(record => {
      const timesheetIdStr = record.timesheetId.toString();
      if (!rejectionMap.has(timesheetIdStr)) {
        rejectionMap.set(timesheetIdStr, {
          reason: record.rejectionReason,
          rejectedBy: record.rejectedBy,
          rejectedAt: record.rejectedAt
        });
      }
    });

    // Add rejection reasons to timesheets
    const timesheetsWithRejections = timesheets.map(ts => {
      const rejection = rejectionMap.get(ts._id.toString());
      return {
        ...ts,
        rejectionReason: rejection?.reason,
        rejectedBy: rejection?.rejectedBy,
        rejectedAt: rejection?.rejectedAt
      };
    });

    res.json({ 
      employee: {
        _id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`
      },
      timesheets: timesheetsWithRejections
    });
  } catch (error) {
    console.error('Error fetching employee timesheets for review:', error);
    res.status(500).json({ 
      message: 'Failed to fetch employee timesheets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Approve timesheets
 * Only timesheets in Pending status can be approved
 */
export const approveTimesheetsHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  const { timesheetIds } = req.body;

  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied. Only supervisors can approve timesheets.'
  );

  appAssert(
    Array.isArray(timesheetIds) && timesheetIds.length > 0,
    400,
    'timesheetIds must be a non-empty array'
  );

  try {
    // Fetch the timesheets to verify permissions and status
    const timesheets = await Timesheet.find({
      _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).populate('userId', '_id').lean();

    appAssert(timesheets.length > 0, NOT_FOUND, 'No timesheets found');

    // Verify supervisor has permission to approve these timesheets
    if (userRole !== UserRole.Admin && userRole !== UserRole.SupervisorAdmin && userRole !== UserRole.SuperAdmin) {
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      
      for (const timesheet of timesheets) {
        const employeeId = (timesheet.userId as any)._id.toString();
        appAssert(
          supervisedUserIds.includes(employeeId),
          FORBIDDEN,
          `You do not have permission to approve timesheets for this employee`
        );
      }
    }

    // Check that all timesheets are in Pending status
    const nonPendingTimesheets = timesheets.filter(
      ts => ts.status !== DailyTimesheetStatus.Pending
    );

    if (nonPendingTimesheets.length > 0) {
      return res.status(400).json({
        message: 'Only timesheets in Pending status can be approved',
        details: `${nonPendingTimesheets.length} timesheet(s) are not in Pending status`
      });
    }

    // Update timesheets to Approved status
    const result = await Timesheet.updateMany(
      {
        _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) },
        status: DailyTimesheetStatus.Pending
      },
      {
        $set: { 
          status: DailyTimesheetStatus.Approved,
          approvalDate: new Date(),
          approvedBy: new mongoose.Types.ObjectId(supervisorId)
        }
      }
    );

    res.json({
      message: 'Timesheets approved successfully',
      approved: result.modifiedCount
    });
  } catch (error) {
    console.error('Error approving timesheets:', error);
    res.status(500).json({
      message: 'Failed to approve timesheets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Reject timesheets with a reason
 * Only timesheets in Pending status can be rejected
 */
export const rejectTimesheetsHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  const { timesheetIds, rejectionReason } = req.body;

  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied. Only supervisors can reject timesheets.'
  );

  appAssert(
    Array.isArray(timesheetIds) && timesheetIds.length > 0,
    400,
    'timesheetIds must be a non-empty array'
  );

  appAssert(
    rejectionReason && rejectionReason.trim().length > 0,
    400,
    'Rejection reason is required'
  );

  try {
    // Fetch the timesheets to verify permissions and status
    const timesheets = await Timesheet.find({
      _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).populate('userId', '_id').lean();

    appAssert(timesheets.length > 0, NOT_FOUND, 'No timesheets found');

    // Verify supervisor has permission to reject these timesheets
    if (userRole !== UserRole.Admin && userRole !== UserRole.SupervisorAdmin && userRole !== UserRole.SuperAdmin) {
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      
      for (const timesheet of timesheets) {
        const employeeId = (timesheet.userId as any)._id.toString();
        appAssert(
          supervisedUserIds.includes(employeeId),
          FORBIDDEN,
          `You do not have permission to reject timesheets for this employee`
        );
      }
    }

    // Check that all timesheets are in Pending status
    const nonPendingTimesheets = timesheets.filter(
      ts => ts.status !== DailyTimesheetStatus.Pending
    );

    if (nonPendingTimesheets.length > 0) {
      return res.status(400).json({
        message: 'Only timesheets in Pending status can be rejected',
        details: `${nonPendingTimesheets.length} timesheet(s) are not in Pending status`
      });
    }

    // Update timesheets to Rejected status
    const result = await Timesheet.updateMany(
      {
        _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) },
        status: DailyTimesheetStatus.Pending
      },
      {
        $set: { 
          status: DailyTimesheetStatus.Rejected,
          rejectionDate: new Date()
        }
      }
    );

    // Create rejection reason records in separate collection
    const rejectionRecords = timesheetIds.map(timesheetId => ({
      timesheetId: new mongoose.Types.ObjectId(timesheetId),
      rejectedBy: new mongoose.Types.ObjectId(supervisorId),
      rejectionReason: rejectionReason.trim(),
      rejectedAt: new Date()
    }));

    await TimesheetRejection.insertMany(rejectionRecords);

    res.json({
      message: 'Timesheets rejected successfully',
      rejected: result.modifiedCount
    });
  } catch (error) {
    console.error('Error rejecting timesheets:', error);
    res.status(500).json({
      message: 'Failed to reject timesheets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update an employee's timesheet
 * Allows supervisors to edit timesheets before approval
 */
export const updateEmployeeTimesheetHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  const { timesheetId } = req.params;
  const { taskId, description, hours, billable, projectId, date } = req.body;

  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied. Only supervisors can update employee timesheets.'
  );

  try {
    // Fetch the timesheet to verify permissions
    const timesheet = await Timesheet.findById(timesheetId).populate('userId', '_id').lean();
    
    appAssert(timesheet, NOT_FOUND, 'Timesheet not found');

    const employeeId = (timesheet.userId as any)._id.toString();

    // Verify supervisor has permission to update this employee's timesheet
    if (userRole !== UserRole.Admin && userRole !== UserRole.SupervisorAdmin && userRole !== UserRole.SuperAdmin) {
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      appAssert(
        supervisedUserIds.includes(employeeId),
        FORBIDDEN,
        'You do not have permission to update this employee\'s timesheet'
      );
    }

    // Only allow updating Pending timesheets (submitted but not yet approved/rejected)
    appAssert(
      timesheet.status === DailyTimesheetStatus.Pending,
      400,
      'Only Pending timesheets can be edited. This timesheet has already been processed.'
    );

    // Build update object
    const updateData: any = {};
    
    if (taskId !== undefined) {
      if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
        updateData.taskId = new mongoose.Types.ObjectId(taskId);
      } else {
        updateData.taskId = null;
      }
    }
    
    if (projectId !== undefined) {
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        updateData.projectId = new mongoose.Types.ObjectId(projectId);
      } else {
        updateData.projectId = null;
      }
    }
    
    if (description !== undefined) updateData.description = description;
    if (hours !== undefined) updateData.hours = Number(hours);
    if (billable !== undefined) updateData.billable = billable;
    if (date !== undefined) updateData.date = new Date(date);

    // Update the timesheet
    const updatedTimesheet = await Timesheet.findByIdAndUpdate(
      timesheetId,
      { $set: updateData },
      { new: true }
    )
      .populate('projectId', 'projectName')
      .populate('taskId', 'taskName')
      .lean();

    res.json(updatedTimesheet);
  } catch (error) {
    console.error('Error updating employee timesheet:', error);
    res.status(500).json({
      message: 'Failed to update timesheet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
