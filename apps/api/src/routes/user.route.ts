import { Router } from 'express';
import { registerHandler, getAllUsersHandler, updateUserHandler } from '../controllers/user.controller';
import { UserRole } from '@tms/shared';
import authenticate from '../middleware/authenticate';

const router = Router();

router.get("/", authenticate(), getAllUsersHandler);
router.post("/admin", authenticate([UserRole.SuperAdmin]), registerHandler(UserRole.Admin));
router.post("/employee", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), registerHandler(UserRole.Emp));
router.put("/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), updateUserHandler);

export  {router as userRoutes};
