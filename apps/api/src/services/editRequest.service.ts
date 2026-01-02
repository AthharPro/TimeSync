import { EditRequest, EditRequestStatus } from '../models/editRequest.model';
import { IEditRequestDocument, CreateEditRequestParams, ApproveEditRequestParams, RejectEditRequestParams } from '../interfaces';
import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { createBulkNotifications } from './notification.service';
import { NotificationType } from '@tms/shared';

/**
 * Create a new edit request for a specific month
 */
export const createEditRequest = async (
  params: CreateEditRequestParams
): Promise<IEditRequestDocument> => {
  const { userId, month, year } = params;

  // Check if there's already a pending request for this user and month
  const existingRequest = await EditRequest.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    month,
    year,
    status: EditRequestStatus.Pending
  });

  if (existingRequest) {
    throw new Error('You already have a pending edit request for this month');
  }

  // Create the edit request
  const editRequest = await EditRequest.create({
    userId: new mongoose.Types.ObjectId(userId),
    month,
    year,
    status: EditRequestStatus.Pending,
    requestDate: new Date()
  });

  // Get user's supervisors (from teams and projects)
  const user = await UserModel.findById(userId).populate('teams');
  
  if (!user) {
    throw new Error('User not found');
  }

  console.log('=== DEBUG: createEditRequest ===');
  console.log('User:', {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    teams: user.teams
  });

  // Find all supervisors from user's teams
  const teamIds = user.teams.map((team: any) => team._id);
  console.log('Team IDs:', teamIds);
  
  const supervisors = await UserModel.find({
    teams: { $in: teamIds },
    role: { $in: ['Admin', 'Manager'] },
    _id: { $ne: userId }
  }).distinct('_id');
  console.log('Found Supervisors:', supervisors);

  // Send notifications to all supervisors
  if (supervisors.length > 0) {
    await createBulkNotifications(
      supervisors.map((id) => id.toString()),
      {
        type: NotificationType.TimesheetEditRequest,
        title: 'Timesheet Edit Request',
        message: `${user.firstName} ${user.lastName} requested permission to edit timesheets for ${month}`,
        relatedId: editRequest._id.toString(),
        relatedModel: 'EditRequest'
      }
    );
  } else {
    console.log('WARNING: No supervisors found to notify!');
  }

  return editRequest;
};

/**
 * Get all edit requests created by the current user
 */
export const getMyEditRequests = async (
  userId: string,
  filters?: { status?: string; month?: string; year?: string }
): Promise<IEditRequestDocument[]> => {
  const query: any = { userId: new mongoose.Types.ObjectId(userId) };

  if (filters?.status && filters.status !== 'All') {
    query.status = filters.status;
  }

  if (filters?.month) {
    query.month = filters.month;
  }

  if (filters?.year) {
    query.year = filters.year;
  }

  const editRequests = await EditRequest.find(query)
    .populate('approvedBy', 'firstName lastName employee_id')
    .populate('rejectedBy', 'firstName lastName employee_id')
    .sort({ requestDate: -1 });

  return editRequests;
};

/**
 * Get all edit requests from employees supervised by the current user
 */
export const getSupervisedEditRequests = async (
  supervisorId: string,
  filters?: { status?: string; month?: string; year?: string }
): Promise<IEditRequestDocument[]> => {
  // Get supervisor's teams
  const supervisor = await UserModel.findById(supervisorId).populate('teams');
  
  if (!supervisor) {
    throw new Error('Supervisor not found');
  }

  console.log('=== DEBUG: getSupervisedEditRequests ===');
  console.log('Supervisor ID:', supervisorId);
  console.log('Supervisor:', {
    firstName: supervisor.firstName,
    lastName: supervisor.lastName,
    role: supervisor.role,
    teams: supervisor.teams
  });

  const teamIds = supervisor.teams.map((team: any) => team._id);
  console.log('Team IDs:', teamIds);

  // Find all users in these teams (excluding the supervisor)
  const supervisedUsers = await UserModel.find({
    teams: { $in: teamIds },
    _id: { $ne: supervisorId }
  }).distinct('_id');
  console.log('Supervised Users:', supervisedUsers);

  const query: any = {
    userId: { $in: supervisedUsers }
  };

  if (filters?.status && filters.status !== 'All') {
    query.status = filters.status;
  }

  if (filters?.month) {
    query.month = filters.month;
  }

  if (filters?.year) {
    query.year = filters.year;
  }

  console.log('Query:', query);

  const editRequests = await EditRequest.find(query)
    .populate('userId', 'firstName lastName employee_id email')
    .populate('approvedBy', 'firstName lastName employee_id')
    .populate('rejectedBy', 'firstName lastName employee_id')
    .sort({ requestDate: -1 });

  console.log('Edit Requests Found:', editRequests.length);
  console.log('Edit Requests:', editRequests);

  return editRequests;
};

/**
 * Approve an edit request
 */
export const approveEditRequest = async (
  params: ApproveEditRequestParams
): Promise<IEditRequestDocument> => {
  const { requestId, approvedBy } = params;

  const editRequest = await EditRequest.findById(requestId).populate('userId', 'firstName lastName');

  if (!editRequest) {
    throw new Error('Edit request not found');
  }

  if (editRequest.status !== EditRequestStatus.Pending) {
    throw new Error('This request has already been processed');
  }

  editRequest.status = EditRequestStatus.Approved;
  editRequest.approvedBy = new mongoose.Types.ObjectId(approvedBy);
  editRequest.approvedDate = new Date();

  await editRequest.save();

  // Send notification to the employee
  const approver = await UserModel.findById(approvedBy);
  const employee = editRequest.userId as any;

  if (approver && employee) {
    await createBulkNotifications(
      [(editRequest.userId as any)._id.toString()],
      {
        type: NotificationType.TimesheetEditApproved,
        title: 'Edit Request Approved',
        message: `Your timesheet edit request for ${editRequest.month} has been approved by ${approver.firstName} ${approver.lastName}`,
        relatedId: editRequest._id.toString(),
        relatedModel: 'EditRequest'
      }
    );
  }

  return editRequest;
};

/**
 * Reject an edit request
 */
export const rejectEditRequest = async (
  params: RejectEditRequestParams
): Promise<IEditRequestDocument> => {
  const { requestId, rejectedBy, rejectionReason } = params;

  const editRequest = await EditRequest.findById(requestId).populate('userId', 'firstName lastName');

  if (!editRequest) {
    throw new Error('Edit request not found');
  }

  if (editRequest.status !== EditRequestStatus.Pending) {
    throw new Error('This request has already been processed');
  }

  editRequest.status = EditRequestStatus.Rejected;
  editRequest.rejectedBy = new mongoose.Types.ObjectId(rejectedBy);
  editRequest.rejectedDate = new Date();
  editRequest.rejectionReason = rejectionReason;

  await editRequest.save();

  // Send notification to the employee
  const rejector = await UserModel.findById(rejectedBy);
  const employee = editRequest.userId as any;

  if (rejector && employee) {
    await createBulkNotifications(
      [(editRequest.userId as any)._id.toString()],
      {
        type: NotificationType.TimesheetEditRejected,
        title: 'Edit Request Rejected',
        message: `Your timesheet edit request for ${editRequest.month} has been rejected by ${rejector.firstName} ${rejector.lastName}. Reason: ${rejectionReason}`,
        relatedId: editRequest._id.toString(),
        relatedModel: 'EditRequest'
      }
    );
  }

  return editRequest;
};

/**
 * Check if user has approved edit permission for a specific month
 */
export const hasEditPermission = async (
  userId: string,
  month: string,
  year: string
): Promise<boolean> => {
  const approvedRequest = await EditRequest.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    month,
    year,
    status: EditRequestStatus.Approved
  });

  return !!approvedRequest;
};
