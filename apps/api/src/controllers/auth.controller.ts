import { catchErrors } from '../utils/error';
import { OK } from '../constants/http';
import { setAuthCookies, clearAuthCookies } from '../utils/auth';
import { loginSchema} from './../schemas/auth.schema';
import { loginUser } from '../services/auth.service';

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body
  });
  const { accessToken, refreshToken, user, isChangedPwd } = await loginUser(
    request
  );

  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: 'Login successful',
    user,
    isChangedPwd,
  });

});

export const logoutHandler = catchErrors(async (req, res) => {
  return clearAuthCookies(res).status(OK).json({
    message: 'Logout successful',
  });
});

// export const refreshHandler = catchErrors(async (req, res) => {
//   const refreshToken = req.cookies.refreshToken as string | undefined;
//   appAssert(refreshToken, UNAUTHORIZED, 'Missing refresh token');

//   const { accessToken, newRefreshToken } = await refreshUserAccessToken(
//     refreshToken
//   );

//   if (newRefreshToken) {
//     res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
//   }

//   return res
//     .status(OK)
//     .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
//     .json({
//       message: 'Access token refreshed',
//     });
// });

// export const changePasswordHandler = catchErrors(async (req, res) => {
//   const request = changePasswordSchema.parse(req.body);

//   const userId = req.userId as string;
//   appAssert(userId, UNAUTHORIZED, 'User not authenticated');

//   const result = await changePassword({
//     userId,
//     newPassword: request.newPassword,
//   });

//   return res.status(OK).json({
//     message: result.message,
//     user: result.user,
//   });
// });


// export const sendPasswordResetHandler = catchErrors(async (req, res) => {
//     const email = emailSchema.parse(req.body.email);
//     await sendPasswordResetEmail(email);

//     return res.status(OK).json({
//         message: "Password reset email sent. Check your email for the reset link."
//     });
// })

// export const resetPasswordHandler = catchErrors(async (req, res) => {
//     const { newPassword, verificationCodeId } = resetPasswordSchema.parse(req.body);

//     const validCode = await VerificationCodeModel.findOne({
//       _id: verificationCodeId,
//       type: VerificationCodeType.PasswordReset,
//       expiresAt: { $gte: new Date() },
//     });
//     appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code');

//     const request = {
//       newPassword,
//       verificationCode: verificationCodeId,
//       userId: validCode.userId.toString(),
//     };

//     const result = await resetPassword(request);

//     return clearAuthCookies(res).status(OK).json({
//         message: "Password reset successful",
//         user: result.user,
//     });
// })

// export const verifyEmailHandler = catchErrors(async (req, res) => {
//   const { code } = req.params;
//   appAssert(code, NOT_FOUND, 'Verification code is required');

//   const result = await verifyEmail(code);

//   return res.status(OK).json({
//     message: "Email verified successfully",
//     user: result.user,
//   });
// });

// export const verifyPasswordResetTokenHandler = catchErrors(async (req, res) => {
//   const authHeader = req.headers.authorization;
//   appAssert(authHeader, NOT_FOUND, 'Authorization header is required');
  
//   const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
//   appAssert(token, NOT_FOUND, 'Reset token is required');

//   const { payload } = verifyToken(token);
//   appAssert(payload, UNAUTHORIZED, 'Invalid or expired reset token');
  
//   appAssert((payload as any).type === 'password-reset', UNAUTHORIZED, 'Invalid token type');

//   const userId = (payload as any).userId;
//   const verificationCodeId = (payload as any).verificationCodeId;

//   const validCode = await VerificationCodeModel.findOne({
//     _id: verificationCodeId,
//     userId: new mongoose.Types.ObjectId(userId),
//     type: VerificationCodeType.PasswordReset,
//     expiresAt: { $gte: new Date() },
//   });
//   appAssert(validCode, NOT_FOUND, 'Reset token has expired or is invalid');

//   const user = await UserModel.findById(userId).select('-password');
//   appAssert(user, NOT_FOUND, 'User not found');

//   return res.status(OK).json({
//     message: "Reset token is valid",
//     user: {
//       id: user._id,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     },
//     verificationCodeId,
//   });
// });

// export const verifyPasswordResetLinkHandler = catchErrors(async (req, res) => {
//   const { token, verificationCode } = req.query;
//   appAssert(token, NOT_FOUND, 'Reset token is required');
//   appAssert(verificationCode, NOT_FOUND, 'Verification code is required');

//   const { payload } = verifyToken(token as string);
//   appAssert(payload, UNAUTHORIZED, 'Invalid or expired reset token');
  
//   appAssert((payload as any).type === 'password-reset', UNAUTHORIZED, 'Invalid token type');

//   const userId = (payload as any).userId;

//   const validCode = await VerificationCodeModel.findOne({
//     _id: verificationCode,
//     userId: new mongoose.Types.ObjectId(userId),
//     type: VerificationCodeType.PasswordReset,
//     expiresAt: { $gte: new Date() },
//   });
//   appAssert(validCode, NOT_FOUND, 'Reset token has expired or is invalid');

//   const user = await UserModel.findById(userId).select('-password');
//   appAssert(user, NOT_FOUND, 'User not found');

//   return res.status(OK).json({
//     message: "Reset token is valid",
//     user: {
//       id: user._id,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     },
//     verificationCodeId: verificationCode,
//   });
// });

// export const getCurrentUser = catchErrors(async (req, res) => {
//   const user = await UserModel.findById(req.userId).select('-password');
  
//   if (!user) {
//     return res.status(NOT_FOUND).json({
//       message: 'User not found',
//     });
//   }

//   return res.status(OK).json({
//     user: {
//       _id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       role: user.role,
//       designation: user.designation,
//       contactNumber: user.contactNumber,
//       isChangedPwd: user.isChangedPwd,
//     },
//   });
// });



