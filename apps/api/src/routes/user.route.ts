import { Router } from 'express';
import { registerHandler, getAllUsersHandler, updateUserHandler,getAllActiveUsersHandler,bulkCreateUsers } from '../controllers/user.controller';
import { UserRole } from '@tms/shared';
import authenticate from '../middleware/authenticate';

const router = Router();

router.get("/", authenticate(), getAllUsersHandler);
router.post("/admin", authenticate([UserRole.SuperAdmin]), registerHandler(UserRole.Admin));
router.post("/employee", authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), registerHandler(UserRole.Emp));
router.put("/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), updateUserHandler);
router.post("/bulk", authenticate([UserRole.Admin, UserRole.SuperAdmin]), bulkCreateUsers);
router.get("/active", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), getAllActiveUsersHandler());

export  {router as userRoutes};
