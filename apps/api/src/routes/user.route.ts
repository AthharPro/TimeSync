import { Router } from 'express';
import { registerHandler } from '../controllers/user.controller';
import { UserRole } from '@tms/shared';

const router = Router();

router.post("/admin", registerHandler(UserRole.Admin));

export  {router as userRoutes};
