import { APP_ORIGIN, CONFLICT, INTERNAL_SERVER_ERROR ,UNAUTHORIZED} from '../constants';
import {UserModel} from '../models';
import { generateRandomPassword, appAssert } from '../utils';
import { CreateUserParams, ChangePasswordParams } from '../interfaces/user';
import { getWelcomeTmsTemplate, sendEmail } from '../utils/email';
import { createHistoryLog, generateHistoryDescription } from '../utils/history';
import { HistoryActionType, HistoryEntityType } from '../interfaces/history';

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
    designation?: string;
    contactNumber?: string;
    status?: boolean;
  },
  performedBy?: string // Optional parameter for tracking who made the change
) => {
  const user = await UserModel.findById(userId);
  
  appAssert(user, INTERNAL_SERVER_ERROR, 'User not found');

  const oldStatus = user.status;
  const changes: string[] = [];

  // Update only the allowed fields
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