import { CREATED, OK } from '../constants';
import { registerSchema } from '../schemas';
import { catchErrors } from '../utils';
import { createUser, getAllUsers, updateUserById ,getAllActiveUsers} from '../services';
import { UserRole } from '@tms/shared';
import { Request, Response } from 'express';

export const registerHandler = (role: UserRole) =>
  catchErrors(async (req: Request, res: Response) => {
    const parsedRequest = registerSchema.parse({
      ...req.body
    });

    const requestWithRole = {
      ...parsedRequest,
      role,
    };

    const user = await createUser(requestWithRole);

    return res.status(CREATED).json(user);
  });

export const getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {
  const rolesParam = req.query.roles;

  const parseRoles = (value: typeof rolesParam): string[] | undefined => {
    if (Array.isArray(value)) {
      const collected = value
        .filter((v): v is string => typeof v === 'string')
        .flatMap((v) => v.split(','));
      const cleaned = collected.map((r) => r.trim()).filter(Boolean);
      return cleaned.length ? cleaned : undefined;
    }

    if (typeof value === 'string' && value.length) {
      const cleaned = value
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      return cleaned.length ? cleaned : undefined;
    }

    return undefined;
  };

  const roles = parseRoles(rolesParam);

  const users = await getAllUsers(roles);
  return res.status(OK).json(users);
});

export const updateUserHandler = catchErrors(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await updateUserById(id, updateData);

  return res.status(OK).json(user);
});

export const getAllActiveUsersHandler = () =>
  catchErrors(async (req: Request, res: Response) => {
    const users = await getAllActiveUsers();
    return res.status(OK).json(users);
  });