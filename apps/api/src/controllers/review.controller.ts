import { RequestHandler } from 'express';
import { UserModel } from '../models/user.model';
import { Timesheet } from '../models/timesheet.model';
import { TimesheetRejection } from '../models/rejectionReason.model';
import TeamModel from '../models/team.model';
import ProjectModel from '../models/project.model';
import { Task } from '../models/task.model';
import appAssert from '../utils/validation/appAssert';
import { FORBIDDEN, NOT_FOUND } from '../constants/http';
import { UserRole, DailyTimesheetStatus, NotificationType } from '@tms/shared';
import { getSupervisedUserIds, getSupervisedProjectAndTeamIds, getNonDepartmentTeamEmployeeIds } from '../utils/data/assignmentUtils';
import mongoose from 'mongoose';
import { createBulkNotifications, createNotification } from '../services/notification.service';

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
    
    if (userRole === UserRole.Admin || userRole === UserRole.SuperAdmin) {
      // Admin and SuperAdmin can see all users except SuperAdmin
      employees = await UserModel.find({ 
        role: { $in: [UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin] }
      })
        .select('_id employee_id firstName lastName email designation')
        .sort({ firstName: 1, lastName: 1 })
        .lean();
    } else {
      // Regular Supervisor and SupervisorAdmin can only see their supervised employees
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
      
      console.log('Found employees:', employees.length);
    }
    
    // Get pending timesheet counts for each employee
    const employeeObjectIds = employees.map(emp => new mongoose.Types.ObjectId(emp._id));
    const pendingCounts = await Timesheet.aggregate([
      {
        $match: {
          userId: { $in: employeeObjectIds },
          status: DailyTimesheetStatus.Pending
        }
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of employee ID to pending count
    const pendingCountMap = new Map(
      pendingCounts.map(item => [item._id.toString(), item.count])
    );

    // Add pending count to each employee
    const employeesWithPendingCount = employees.map(emp => ({
      ...emp,
      pendingTimesheetCount: pendingCountMap.get(emp._id.toString()) || 0
    }));
    
    res.json({ employees: employeesWithPendingCount });
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
    
    // Note: Supervisor can see ALL timesheets of the employee, not just supervised projects/teams
    // Permission checks for approve/reject/edit will be done in those specific handlers

    // Fetch timesheets WITHOUT population first
    const rawTimesheets = await Timesheet.find(query)
      .sort({ date: -1 })
      .lean();

    // Manually populate and check if projectId is actually a team
    const enrichedTimesheets = await Promise.all(
      rawTimesheets.map(async (ts: any) => {
        // Populate project and include isPublic flag
        if (ts.projectId) {
          const projectData = await ProjectModel.findById(ts.projectId).select('projectName isPublic').lean();
          if (projectData) {
            ts.projectId = {
              _id: ts.projectId,
              projectName: projectData.projectName,
              isPublic: projectData.isPublic !== undefined ? projectData.isPublic : false
            };
          } else {
            // Project not found
            ts.projectId = null;
          }
        }
        
        // Populate task
        if (ts.taskId) {
          const taskData = await Task.findById(ts.taskId).select('taskName').lean();
          if (taskData) {
            ts.taskId = {
              _id: ts.taskId,
              taskName: taskData.taskName
            };
          }
        }
        
        // Populate team (if teamId field is used) and include isDepartment flag
        if (ts.teamId) {
          const teamData = await TeamModel.findById(ts.teamId).select('teamName isDepartment').lean();
          if (teamData) {
            ts.teamId = {
              _id: ts.teamId,
              teamName: teamData.teamName,
              isDepartment: teamData.isDepartment !== undefined ? teamData.isDepartment : true
            };
          }
        }
        
        return ts;
      })
    );

    // Get rejection reasons for rejected timesheets
    const timesheetIds = enrichedTimesheets.map(ts => ts._id);
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
    const timesheetsWithRejections = enrichedTimesheets.map(ts => {
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
    // For Supervisor and SupervisorAdmin, check if they supervise the employee
    // Admin and SuperAdmin can approve any timesheet
    if (userRole !== UserRole.Admin && userRole !== UserRole.SuperAdmin) {
      // Get all supervised employee IDs
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      
      for (const timesheet of timesheets) {
        const employeeId = (timesheet.userId as any)._id.toString();
        
        // Check if this employee is supervised by this supervisor
        appAssert(
          supervisedUserIds.includes(employeeId),
          FORBIDDEN,
          `You do not have permission to approve this timesheet. You can only approve timesheets for employees you supervise.`
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

    // Send notifications to affected employees
    try {
      // Group timesheets by employee
      const timesheetsByEmployee = new Map<string, typeof timesheets>();
      timesheets.forEach(ts => {
        const employeeId = (ts.userId as any)._id.toString();
        if (!timesheetsByEmployee.has(employeeId)) {
          timesheetsByEmployee.set(employeeId, []);
        }
        timesheetsByEmployee.get(employeeId)!.push(ts);
      });

      // Get supervisor info for the notification message
      const supervisor = await UserModel.findById(supervisorId).select('firstName lastName').lean();
      const supervisorName = supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Your supervisor';

      // Send individual notifications to each employee with their specific timesheet dates
      for (const [employeeId, employeeTimesheets] of timesheetsByEmployee.entries()) {
        // Get the date range or month information
        const dates = employeeTimesheets.map(ts => new Date(ts.date));
        dates.sort((a, b) => a.getTime() - b.getTime());
        
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        
        // Format month and year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[firstDate.getMonth()];
        const year = firstDate.getFullYear();
        
        // Create a descriptive message with date information
        let dateInfo = '';
        if (employeeTimesheets.length === 1) {
          dateInfo = `for ${firstDate.getDate()} ${month} ${year}`;
        } else if (firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear()) {
          dateInfo = `for ${month} ${year}`;
        } else {
          dateInfo = `from ${firstDate.getDate()} ${monthNames[firstDate.getMonth()]} ${firstDate.getFullYear()} to ${lastDate.getDate()} ${monthNames[lastDate.getMonth()]} ${lastDate.getFullYear()}`;
        }

        await createNotification({
          userId: employeeId,
          type: NotificationType.TimesheetApproved,
          title: 'Timesheets Approved',
          message: `${supervisorName} has approved ${employeeTimesheets.length} of your timesheet(s) ${dateInfo}`,
          relatedId: supervisorId,
          relatedModel: 'User',
        });
      }
    } catch (error) {
      console.error('Error sending approval notifications:', error);
      // Don't fail the approval if notification fails
    }

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
    // For Supervisor and SupervisorAdmin, check if they supervise the employee
    // Admin and SuperAdmin can reject any timesheet
    if (userRole !== UserRole.Admin && userRole !== UserRole.SuperAdmin) {
      // Get all supervised employee IDs
      const supervisedUserIds = await getSupervisedUserIds(supervisorId);
      
      for (const timesheet of timesheets) {
        const employeeId = (timesheet.userId as any)._id.toString();
        
        // Check if this employee is supervised by this supervisor
        appAssert(
          supervisedUserIds.includes(employeeId),
          FORBIDDEN,
          `You do not have permission to reject this timesheet. You can only reject timesheets for employees you supervise.`
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

    // Send notifications to affected employees
    try {
      // Group timesheets by employee
      const timesheetsByEmployee = new Map<string, typeof timesheets>();
      timesheets.forEach(ts => {
        const employeeId = (ts.userId as any)._id.toString();
        if (!timesheetsByEmployee.has(employeeId)) {
          timesheetsByEmployee.set(employeeId, []);
        }
        timesheetsByEmployee.get(employeeId)!.push(ts);
      });

      // Get supervisor info for the notification message
      const supervisor = await UserModel.findById(supervisorId).select('firstName lastName').lean();
      const supervisorName = supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Your supervisor';

      // Send individual notifications to each employee with their specific timesheet dates
      for (const [employeeId, employeeTimesheets] of timesheetsByEmployee.entries()) {
        // Get the date range or month information
        const dates = employeeTimesheets.map(ts => new Date(ts.date));
        dates.sort((a, b) => a.getTime() - b.getTime());
        
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        
        // Format month and year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[firstDate.getMonth()];
        const year = firstDate.getFullYear();
        
        // Create a descriptive message with date information
        let dateInfo = '';
        if (employeeTimesheets.length === 1) {
          dateInfo = `for ${firstDate.getDate()} ${month} ${year}`;
        } else if (firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear()) {
          dateInfo = `for ${month} ${year}`;
        } else {
          dateInfo = `from ${firstDate.getDate()} ${monthNames[firstDate.getMonth()]} ${firstDate.getFullYear()} to ${lastDate.getDate()} ${monthNames[lastDate.getMonth()]} ${lastDate.getFullYear()}`;
        }

        await createNotification({
          userId: employeeId,
          type: NotificationType.TimesheetRejected,
          title: 'Timesheets Rejected',
          message: `${supervisorName} has rejected ${employeeTimesheets.length} of your timesheet(s) ${dateInfo}. Reason: ${rejectionReason.trim()}`,
          relatedId: supervisorId,
          relatedModel: 'User',
        });
      }
    } catch (error) {
      console.error('Error sending rejection notifications:', error);
      // Don't fail the rejection if notification fails
    }

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

    // Verify supervisor has permission to update this timesheet
    // Permission is granted if:
    // 1. User is Admin/SuperAdmin/SupervisorAdmin (unrestricted access), OR
    // 2. Timesheet is from a public project (isPublic: true), OR
    // 3. Supervisor supervises the project/team of the timesheet, OR
    // 4. Employee is in a non-department team (isDepartment: false) supervised by this supervisor
    if (userRole !== UserRole.Admin && userRole !== UserRole.SupervisorAdmin && userRole !== UserRole.SuperAdmin) {
      // Check if the timesheet is from a public project
      let isFromPublicProject = false;
      if (timesheet.projectId) {
        const project = await ProjectModel.findById(timesheet.projectId).select('isPublic').lean();
        isFromPublicProject = project?.isPublic === true;
      }
      
      if (!isFromPublicProject) {
        // Not a public project, check other permissions
        // Get employees in non-department teams supervised by this supervisor
        const nonDeptTeamEmployeeIds = await getNonDepartmentTeamEmployeeIds(supervisorId);
        
        // If employee is in a non-department team, supervisor can edit ALL their timesheets
        const isInNonDeptTeam = nonDeptTeamEmployeeIds.includes(employeeId);
        
        if (!isInNonDeptTeam) {
          // Employee is NOT in a non-department team
          // Check if supervisor supervises the specific project or team of this timesheet
          const { projectIds, teamIds } = await getSupervisedProjectAndTeamIds(supervisorId);
          
          const timesheetProjectId = timesheet.projectId?.toString();
          const timesheetTeamId = timesheet.teamId?.toString();
          
          // Check if the supervisor supervises the project or team of this timesheet
          const hasProjectPermission = timesheetProjectId && projectIds.includes(timesheetProjectId);
          const hasTeamPermission = timesheetTeamId && teamIds.includes(timesheetTeamId);
          
          appAssert(
            hasProjectPermission || hasTeamPermission,
            FORBIDDEN,
            'You do not have permission to update this timesheet. You can only update timesheets for public projects, projects or teams you supervise, or for employees in your non-department teams.'
          );
        }
      }
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

/**
 * Get employee IDs from non-department teams supervised by the current supervisor
 * These employees' ALL timesheets can be approved/rejected/edited regardless of project/team
 */
export const getNonDepartmentTeamEmployeeIdsHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;

  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied. Only supervisors can access this endpoint.'
  );

  try {
    let employeeIds: string[] = [];

    if (userRole === UserRole.Admin || userRole === UserRole.SuperAdmin) {
      // Admins can approve any timesheet, so return empty array (no restrictions)
      employeeIds = [];
    } else {
      // Get employees from non-department teams supervised by this supervisor
      employeeIds = await getNonDepartmentTeamEmployeeIds(supervisorId);
    }

    res.json({ employeeIds });
  } catch (error) {
    console.error('Error fetching non-department team employee IDs:', error);
    res.status(500).json({
      message: 'Failed to fetch non-department team employee IDs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
