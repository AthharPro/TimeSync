import { APP_ORIGIN, CONFLICT, INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN } from '../constants';
import {UserModel} from '../models';
import { generateRandomPassword, appAssert } from '../utils';
import { CreateUserParams, ChangePasswordParams } from '../interfaces/user';
import { getWelcomeTmsTemplate, sendEmail } from '../utils/email';
import { createHistoryLog, generateHistoryDescription } from '../utils/history';
import { HistoryActionType, HistoryEntityType } from '../interfaces/history';
import { UserRole } from '@tms/shared';

export const createUser = async (data: CreateUserParams, createdBy?: string) => {
  const existingUser = await UserModel.exists({
    email: data.email,
  });

  appAssert(!existingUser, CONFLICT, 'Email already exists');

  const generatedPassword = generateRandomPassword();
  console.log('Generated Password: ', generatedPassword);

  const user = await UserModel.create({
    email: data.email,
    password: generatedPassword,
    designation: data.designation,
    firstName: data.firstName,
    lastName: data.lastName,
    contactNumber: data.contactNumber,
    role: data.role,
  });

  appAssert(user, INTERNAL_SERVER_ERROR, 'User creation failed');

  // Create history log
  try {
    // Get the user who created this user (authenticated admin)
    const creator = createdBy ? await UserModel.findById(createdBy) : null;
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'System';
    const creatorEmail = creator ? creator.email : 'system@timesync.com';
    
    await createHistoryLog({
      actionType: HistoryActionType.USER_CREATED,
      entityType: HistoryEntityType.USER,
      entityId: user._id,
      entityName: `${user.firstName} ${user.lastName}`,
      performedBy: createdBy || user._id,
      performedByName: creatorName,
      performedByEmail: creatorEmail,
      description: generateHistoryDescription(
        HistoryActionType.USER_CREATED,
        `${user.firstName} ${user.lastName}`
      ),
      metadata: { role: user.role, email: user.email },
    });
  } catch (error) {
    console.error('Failed to create history log for user creation:', error);
  }

    sendEmail({
    to: user.email,
    ...getWelcomeTmsTemplate(APP_ORIGIN,user.email,generatedPassword),
  });

  return {
    user: user.omitPassword(),
  };
};

export const getAllUsers = async (roles?: string[]) => {
  // Apply optional role filtering when provided
  const query = roles?.length ? { role: { $in: roles } } : {};

  const users = await UserModel.find(query).select('-password');
  return users;
};

export const updateUserById = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    designation?: string;
    contactNumber?: string;
    status?: boolean;
  },
  performedBy?: string // Optional parameter for tracking who made the change
) => {
  const user = await UserModel.findById(userId);
  
  appAssert(user, INTERNAL_SERVER_ERROR, 'User not found');

  // Prevent Admins and SupervisorAdmins from modifying SuperAdmin accounts
  if (performedBy) {
    const performer = await UserModel.findById(performedBy);
    
    if (performer && user.role === UserRole.SuperAdmin) {
      // Only SuperAdmin can modify SuperAdmin accounts
      appAssert(
        performer.role === UserRole.SuperAdmin,
        FORBIDDEN,
        'You do not have permission to modify Super Admin accounts'
      );
    }
  }

  // Check if email is being changed and if it already exists
  if (data.email !== undefined && data.email !== user.email) {
    const existingUser = await UserModel.exists({
      email: data.email,
      _id: { $ne: userId },
    });
    appAssert(!existingUser, CONFLICT, 'Email already exists');
  }

  const oldStatus = user.status;
  const changes: string[] = [];

  // Update only the allowed fields
  if (data.firstName !== undefined) {
    user.firstName = data.firstName;
    changes.push('first name');
  }
  if (data.lastName !== undefined) {
    user.lastName = data.lastName;
    changes.push('last name');
  }
  if (data.email !== undefined) {
    user.email = data.email;
    changes.push('email');
  }
  if (data.designation !== undefined) {
    user.designation = data.designation;
    changes.push('designation');
  }
  if (data.contactNumber !== undefined) {
    user.contactNumber = data.contactNumber;
    changes.push('contact number');
  }
  if (data.status !== undefined) {
    user.status = data.status;
    changes.push('status');
  }

  await user.save();

  // Create history log for updates
  try {
    const entityName = `${user.firstName} ${user.lastName}`;
    const actorId = performedBy || user._id;
    const actor = performedBy ? await UserModel.findById(performedBy) : user;
    const actorName = actor ? `${actor.firstName} ${actor.lastName}` : entityName;
    const actorEmail = actor ? actor.email : user.email;

    if (data.status !== undefined && oldStatus !== data.status) {
      // Status change gets its own history entry
      await createHistoryLog({
        actionType: HistoryActionType.USER_STATUS_CHANGED,
        entityType: HistoryEntityType.USER,
        entityId: user._id,
        entityName,
        performedBy: actorId,
        performedByName: actorName,
        performedByEmail: actorEmail,
        description: generateHistoryDescription(
          HistoryActionType.USER_STATUS_CHANGED,
          entityName,
          { status: data.status }
        ),
        metadata: { oldStatus, newStatus: data.status },
      });
    }

    if (changes.length > 0 && (data.status === undefined || changes.length > 1)) {
      // General update log
      await createHistoryLog({
        actionType: HistoryActionType.USER_UPDATED,
        entityType: HistoryEntityType.USER,
        entityId: user._id,
        entityName,
        performedBy: actorId,
        performedByName: actorName,
        performedByEmail: actorEmail,
        description: generateHistoryDescription(HistoryActionType.USER_UPDATED, entityName),
        metadata: { changes, updatedFields: data },
      });
    }
  } catch (error) {
    console.error('Failed to create history log for user update:', error);
  }

  return {
    user: user.omitPassword(),
  };
};

//for components that need to show available users
export const getAllActiveUsers = async () => {
  const data = await UserModel.find({ status: true }).lean();
  const users = data.map((user) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  return {
    users,
  };
};

export const changePassword = async (data: ChangePasswordParams) => {
  const user = await UserModel.findById(data.userId);
  appAssert(user, UNAUTHORIZED, 'User not found');

  // Update password and set isChangedPwd to true
  user.password = data.newPassword;
  user.isChangedPwd = true;
  
  await user.save();

  return {
    user: user.omitPassword(),
    message: 'Password changed successfully',
  };
};

export const getUserSupervisors = async (userId: string) => {
  const { getSupervisorsForUser } = await import('../utils/data/assignmentUtils');
  
  // Get supervisor IDs
  const supervisorIds = await getSupervisorsForUser(userId);
  
  // Filter out the user themselves (in case they are their own supervisor)
  const filteredSupervisorIds = supervisorIds.filter(id => id !== userId);
  
  // Fetch supervisor details
  const supervisors = await UserModel.find({ 
    _id: { $in: filteredSupervisorIds } 
  })
    .select('_id firstName lastName email')
    .lean();
  
  return {
    supervisors: supervisors.map(supervisor => ({
      _id: supervisor._id.toString(),
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      email: supervisor.email,
    })),
  };
};