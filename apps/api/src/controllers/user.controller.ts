import { CREATED, OK } from '../constants';
import { registerSchema } from '../schemas';
import { catchErrors } from '../utils';
import { createUser, getAllUsers, updateUserById } from '../services';
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
  const users = await getAllUsers();
  return res.status(OK).json(users);
});

export const updateUserHandler = catchErrors(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await updateUserById(id, updateData);

  return res.status(OK).json(user);
});
