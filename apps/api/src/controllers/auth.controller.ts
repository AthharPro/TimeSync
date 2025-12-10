import { appAssert, catchErrors } from '../utils';
import { OK, UNAUTHORIZED } from '../constants';
import { loginSchema} from './../schemas';
import { loginUser ,getAccessToken,getUserFromRefreshToken} from '../services';


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

export const getCurrentUser = catchErrors(async (req, res) => {

    const refreshToken = req.cookies.refreshToken as string | undefined;
    console.log("Refresh Token from cookies:", refreshToken);
  appAssert(refreshToken, UNAUTHORIZED, 'Missing refresh token');
 
  const { newAccessToken, user } = await getUserFromRefreshToken(refreshToken);

console.log("User fetched from refresh token:", user, "New Access Token:", newAccessToken);

  return res.status(OK).json({
    message: 'Current user fetched successfully',
    accessToken: newAccessToken,
    user
  });
});

export const refreshHandler = catchErrors(async (req, res) => {

    const refreshToken = req.cookies.refreshToken as string | undefined;
    console.log("Refresh Token from cookies:", refreshToken);
  appAssert(refreshToken, UNAUTHORIZED, 'Missing refresh token');
 
  const { newAccessToken } = await getAccessToken(refreshToken);


  return res.status(OK).json({
    message: 'Access token refreshed successfully',
    accessToken: newAccessToken
  });
});
