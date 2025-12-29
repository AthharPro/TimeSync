import { UNAUTHORIZED,NOT_FOUND,TOO_MANY_REQUESTS ,INTERNAL_SERVER_ERROR} from '../constants';
import {
  REFRESH_TOKEN_OPTIONS,
  signToken,
  appAssert,
  verifyToken,
  refreshTokenSignOptions,
} from '../utils';
import { IRefreshTokenPayload, LoginParams } from '../interfaces';
import { UserModel } from '../models';
import { ONE_DAY_MS, thirtyDaysFromNow, fiveMinutesAgo, oneHourFromNow } from '../utils/data';
import VerificationCodeModel from '../models/verificationCode.model';
import VerificationCodeType from '../constants/verificationCodeType';
import { JWT_SECRET } from '../constants/env';
import { APP_ORIGIN } from '../constants/env';
import { sendEmail, getPasswordResetTemplate } from '../utils/email';
import { hashValue } from '../utils/auth';
import SessionModel from '../models/session.model';

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

export const sendPasswordResetEmail = async (email: string) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, NOT_FOUND, 'User not found');

  appAssert(user.status !== false, UNAUTHORIZED, 'Account is deactivated. Please contact administrator.');

  //check email rate limit
  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gte: fiveMinAgo },
  });

  appAssert(
    count < 1,
    TOO_MANY_REQUESTS,
    'Too many requests, please try again later'
  );

  const expiresAt = oneHourFromNow();
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  // Generate a user token for frontend identification
  const userToken = signToken(
    {
      userId: user._id.toString(),
      verificationCodeId: verificationCode._id.toString(),
      type: 'password-reset',
    } as any,
    { expiresIn: '1h', secret: JWT_SECRET }
  );

  const url = `${APP_ORIGIN}/password/reset?token=${userToken}&verificationCode=${verificationCode._id}`;
  const data = await sendEmail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });
  appAssert(data?.messageId, INTERNAL_SERVER_ERROR, `Failed to send email`);

  return {
    url,
    emailId: data.messageId,
  };
};

type ResetPasswordParams = {
  newPassword: string;
  verificationCode: string;
  userId: string;
};

export const resetPassword = async ({
  newPassword,
  verificationCode,
  userId,
}: ResetPasswordParams) => {
  
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gte: new Date() },
  });

  appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code');

  appAssert(
    validCode.userId.toString() === userId,
    UNAUTHORIZED,
    'Invalid verification code for this user'
  );

  const user = await UserModel.findById(validCode.userId);
  appAssert(user, NOT_FOUND, 'User not found');

  const updateData: any = {
    password: await hashValue(newPassword),
    isChangedPwd: true,
  };

  const updateUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    updateData,
    { new: true }
  );
  appAssert(updateUser, INTERNAL_SERVER_ERROR, 'Failed to reset password');

  await validCode.deleteOne();
  await SessionModel.deleteMany({ userId: updateUser._id });

  return {
    user: updateUser.omitPassword(),
  };
};


export const verifyEmail = async (code: string) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code');

  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      isVerified: true,
    },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, 'Failed to verify email');

  await validCode.deleteOne();

  return {
    user: updatedUser.omitPassword(),
  };
};
