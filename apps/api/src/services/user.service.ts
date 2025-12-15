import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants';
import {UserModel} from '../models';
import { generateRandomPassword } from '../utils';
import { CreateUserParams } from '../interfaces';
import { appAssert } from '../utils';

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

  return {
    user: user.omitPassword(),
  };
};

export const getAllUsers = async () => {
  const users = await UserModel.find({}).select('-password');
  return users;
};
