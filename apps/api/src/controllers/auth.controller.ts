import { catchErrors } from '../utils';
import { OK } from '../constants';
import { loginSchema} from './../schemas';
import { loginUser } from '../services';

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body
  });
  const { accessToken, refreshToken, user } = await loginUser({
    email: request.email,
    password: request.password
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.status(OK).json({
    message: 'Login successful',
    accessToken,
    user
  });

});

export const logoutHandler = catchErrors(async (req, res) => {
  return res.clearCookie('refreshToken', {path:"/auth/refresh"}).status(OK).json({
    message:"Logout successful"
  });
});

