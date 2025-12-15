import { Router } from 'express';
import { registerHandler, getAllUsersHandler } from '../controllers/user.controller';
import { UserRole } from '@tms/shared';
import authenticate from '../middleware/authenticate';

const router = Router();

router.get("/", authenticate(), getAllUsersHandler);
router.post("/admin", registerHandler(UserRole.Admin));

export  {router as userRoutes};
