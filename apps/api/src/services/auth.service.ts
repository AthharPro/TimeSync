import UserModel from '../models/user.model';
import { ONE_DAY_MS, thirtyDaysFromNow, fiveMinutesAgo, oneHourFromNow } from '../utils/data';
import {
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
} from '../constants/http';
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from '../utils/auth';
import { APP_ORIGIN } from '../constants/env';
import VerificationCodeModel from '../models/verificationCode.model';
import { hashValue } from '../utils/auth';
import { JWT_SECRET } from '../constants/env';
import { LoginParams } from '../interfaces/auth';
import { appAssert } from '../utils';

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, 'Invalid email');
  appAssert(user.status !== false, UNAUTHORIZED, 'Account is deactivated. Please contact administrator.');

  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, 'Invalid password');

  const userId = user._id;

  // Create session info without actual session for now
  const sessionInfo = {
    sessionId: userId, // Using userId as sessionId temporarily
  };

  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userId: user._id,
    role: user.role,
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
    isChangedPwd: user.isChangedPwd,
  };
};

// export const refreshUserAccessToken = async (refreshToken: string) => {
//   const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
//     secret: refreshTokenSignOptions.secret,
//   });

//   appAssert(payload, UNAUTHORIZED, 'Invalid refresh token');

//   const session = await SessionModel.findById(payload.sessionId);

//   const now = Date.now();
//   appAssert(
//     session && session.expiresAt.getTime() > now,
//     UNAUTHORIZED,
//     'Session expired'
//   );

//   const sessionNeedsRefresh = session.expiresAt.getTime() - now < ONE_DAY_MS;

//   if (sessionNeedsRefresh) {
//     session.expiresAt = thirtyDaysFromNow();
//     await session.save();
//   }

//   const newRefreshToken = sessionNeedsRefresh
//     ? signToken(
//         {
//           sessionId: session._id,
//         },
//         refreshTokenSignOptions
//       )
//     : undefined;

//   const user = await UserModel.findById(session.userId).select('role status');
//   appAssert(user, UNAUTHORIZED, 'User not found');
  
//   appAssert(user.status !== false, UNAUTHORIZED, 'Account is deactivated. Please contact administrator.');

//   const accessToken = signToken({
//     userId: session.userId,
//     sessionId: session._id,
//     role: user.role,
//   });

//   return {
//     accessToken,
//     newRefreshToken,
//   };
// };

// export const sendPasswordResetEmail = async (email: string) => {
//   const user = await UserModel.findOne({ email });
//   appAssert(user, NOT_FOUND, 'User not found');

//   appAssert(user.status !== false, UNAUTHORIZED, 'Account is deactivated. Please contact administrator.');

//   //check email rate limit
//   const fiveMinAgo = fiveMinutesAgo();
//   const count = await VerificationCodeModel.countDocuments({
//     userId: user._id,
//     type: VerificationCodeType.PasswordReset,
//     createdAt: { $gte: fiveMinAgo },
//   });

//   appAssert(
//     count < 1,
//     TOO_MANY_REQUESTS,
//     'Too many requests, please try again later'
//   );

//   const expiresAt = oneHourFromNow();
//   const verificationCode = await VerificationCodeModel.create({
//     userId: user._id,
//     type: VerificationCodeType.PasswordReset,
//     expiresAt,
//   });

//   // Generate a user token for frontend identification
//   const userToken = signToken(
//     {
//       userId: user._id.toString(),
//       verificationCodeId: verificationCode._id.toString(),
//       type: 'password-reset',
//     } as any,
//     { expiresIn: '1h', secret: JWT_SECRET }
//   );

//   const url = `${APP_ORIGIN}/password/reset?token=${userToken}&verificationCode=${verificationCode._id}`;
//   const data = await sendEmail({
//     to: user.email,
//     ...getPasswordResetTemplate(url),
//   });
//   appAssert(data?.messageId, INTERNAL_SERVER_ERROR, `Failed to send email`);

//   return {
//     url,
//     emailId: data.messageId,
//   };
// };

// type ResetPasswordParams = {
//   newPassword: string;
//   verificationCode: string;
//   userId: string;
// };

// export const resetPassword = async ({
//   newPassword,
//   verificationCode,
//   userId,
// }: ResetPasswordParams) => {
  
//   const validCode = await VerificationCodeModel.findOne({
//     _id: verificationCode,
//     type: VerificationCodeType.PasswordReset,
//     expiresAt: { $gte: new Date() },
//   });

//   appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code');

//   appAssert(
//     validCode.userId.toString() === userId,
//     UNAUTHORIZED,
//     'Invalid verification code for this user'
//   );

//   const user = await UserModel.findById(validCode.userId);
//   appAssert(user, NOT_FOUND, 'User not found');

//   const updateData: any = {
//     password: await hashValue(newPassword),
//     isChangedPwd: true,
//   };

//   const updateUser = await UserModel.findByIdAndUpdate(
//     validCode.userId,
//     updateData,
//     { new: true }
//   );
//   appAssert(updateUser, INTERNAL_SERVER_ERROR, 'Failed to reset password');

//   await validCode.deleteOne();
//   await SessionModel.deleteMany({ userId: updateUser._id });

//   return {
//     user: updateUser.omitPassword(),
//   };
// };

// export const verifyEmail = async (code: string) => {
//   const validCode = await VerificationCodeModel.findOne({
//     _id: code,
//     type: VerificationCodeType.EmailVerification,
//     expiresAt: { $gt: new Date() },
//   });
//   appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code');

//   const updatedUser = await UserModel.findByIdAndUpdate(
//     validCode.userId,
//     {
//       isVerified: true,
//     },
//     { new: true }
//   );
//   appAssert(updatedUser, INTERNAL_SERVER_ERROR, 'Failed to verify email');

//   await validCode.deleteOne();

//   return {
//     user: updatedUser.omitPassword(),
//   };
// };
