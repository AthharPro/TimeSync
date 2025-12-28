import { APP_ORIGIN, CONFLICT, INTERNAL_SERVER_ERROR } from '../constants';
import {UserModel} from '../models';
import { generateRandomPassword } from '../utils';
import { CreateUserParams } from '../interfaces';
import { appAssert } from '../utils';
import { getWelcomeTmsTemplate, sendEmail } from '../utils/email';

export const createUser = async (data: CreateUserParams) => {
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
  }
) => {
  const user = await UserModel.findById(userId);
  
  appAssert(user, INTERNAL_SERVER_ERROR, 'User not found');

  // Update only the allowed fields
  if (data.designation !== undefined) {
    user.designation = data.designation;
  }
  if (data.contactNumber !== undefined) {
    user.contactNumber = data.contactNumber;
  }
  if (data.status !== undefined) {
    user.status = data.status;
  }

  await user.save();

  return {
    user: user.omitPassword(),
  };
};

//for components that need to show available users
export const getAllActiveUsers = async () => {
  const data = await UserModel.find({ status: true }).lean();
  const users = data.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  return {
    users,
  };
};
