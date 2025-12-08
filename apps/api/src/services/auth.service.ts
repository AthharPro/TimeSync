
import {
  UNAUTHORIZED,
} from '../constants';
import {
  REFRESH_TOKEN_OPTIONS,
  signToken,appAssert
} from '../utils';
import { LoginParams } from '../interfaces';
import {UserModel} from '../models';

export const loginUser = async ({
  email,
  password
}: LoginParams) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, 'Invalid email');
  appAssert(user.status !== false, UNAUTHORIZED, 'Account is deactivated. Please contact administrator.');

  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, 'Invalid password');


  const refreshToken = signToken(
    { userId: user._id as string },
    REFRESH_TOKEN_OPTIONS
  );

  const accessToken = signToken({
    userId: user._id as string,
    role: user.role,
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken
  };
};
