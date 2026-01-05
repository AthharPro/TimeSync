import { CREATED, OK } from '../constants';
import { userRegisterSchema } from '../schemas';
import { catchErrors } from '../utils';
import { createUser, getAllUsers, updateUserById ,getAllActiveUsers} from '../services';
import { UserRole } from '@tms/shared';
import { Request, Response } from 'express';

export const registerHandler = (role: UserRole) =>
  catchErrors(async (req: Request, res: Response) => {
    const parsedRequest = userRegisterSchema.parse({
      ...req.body
    });

    const requestWithRole = {
      ...parsedRequest,
      role,
    };

    const user = await createUser(requestWithRole, req.userId);

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

export const bulkCreateUsers = async (req: Request, res: Response) => {
  try {
    const { users, role } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'No users provided' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const user of users) {
      try {
        await createUser({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          designation: user.designation,
          contactNumber: user.contactNumber,
          role,
        }, req.userId);

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          email: user.email,
          message: err.message || 'Failed to create user',
        });
      }
    }

    res.status(200).json({
      message: 'Bulk account creation completed',
      results,
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ message: 'Bulk account creation failed' });
  }
};

export const getAllActiveUsersHandler = () =>
  catchErrors(async (req: Request, res: Response) => {
    const users = await getAllActiveUsers();
    return res.status(OK).json(users);
  });
