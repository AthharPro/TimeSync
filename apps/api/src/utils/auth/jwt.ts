import jwt, { VerifyOptions, SignOptions } from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../../constants/env';
import { IAccessTokenPayload, IRefreshTokenPayload, ITokenOptions } from '../../interfaces';

const DEFAULT_SIGN_OPTIONS: SignOptions = {
  audience: 'user',
};

export const refreshTokenSignOptions: ITokenOptions = {
  expiresIn: '30d',
  secret: JWT_REFRESH_SECRET,
};

const ACCESS_TOKEN_OPTIONS: ITokenOptions = {
  expiresIn: '30d',
  secret: JWT_SECRET
};

export const REFRESH_TOKEN_OPTIONS: ITokenOptions = {
  expiresIn: '30d',
  secret: JWT_REFRESH_SECRET
};

export const signToken = (
  payload: IAccessTokenPayload | IRefreshTokenPayload,
  options?: ITokenOptions
) => {
  const { secret, ...signOpts } = options || ACCESS_TOKEN_OPTIONS;
  return jwt.sign(payload, secret, {
    ...DEFAULT_SIGN_OPTIONS,
    ...signOpts,
  });
};

export const verifyToken = <TPayload extends object = IAccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret?: string }
) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options || {};
  try {
    return {
      payload: jwt.verify(token, secret, verifyOpts) as TPayload,
    };
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
};