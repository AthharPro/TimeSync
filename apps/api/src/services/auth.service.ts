import { UNAUTHORIZED } from '../constants';
import {
  REFRESH_TOKEN_OPTIONS,
  signToken,
  appAssert,
  verifyToken,
  refreshTokenSignOptions,
} from '../utils';
import { IRefreshTokenPayload, LoginParams } from '../interfaces';
import { UserModel } from '../models';

export const loginUser = async ({ email, password }: LoginParams) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, 'Invalid email');
  appAssert(
    user.status !== false,
    UNAUTHORIZED,
    'Account is deactivated. Please contact administrator.'
  );

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
    refreshToken,
  };
};

export const getUserFromRefreshToken = async (refreshToken: string) => {
  const { payload } = verifyToken<IRefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, 'Invalid refresh token');

  const fetchUser = await UserModel.findOne({ _id: payload.userId });

  appAssert(fetchUser, UNAUTHORIZED, 'User not found');

  const newAccessToken = signToken({
    userId: fetchUser._id as string,
    role: fetchUser.role,
  });

  appAssert(newAccessToken, UNAUTHORIZED, 'Could not create access token');

  return {
    user: fetchUser.omitPassword(),
    newAccessToken,
  };
};

export const getAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<IRefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, 'Invalid refresh token');

  const fetchUser = await UserModel.findOne({ _id: payload.userId });

  appAssert(fetchUser, UNAUTHORIZED, 'User not found');

  const newAccessToken = signToken({
    userId: fetchUser._id as string,
    role: fetchUser.role,
  });

  appAssert(newAccessToken, UNAUTHORIZED, 'Could not create access token');

  return {
    newAccessToken,
  };
};