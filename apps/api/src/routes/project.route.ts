import { Router } from 'express';
import {createHandler, listHandler, listMyProjectsHandler, updateStaffHandler, deleteHandler, activateHandler, listSupervisedProjectsHandler} from "../controllers/project.controller";
import authenticate from '../middleware/authenticate';
import { UserRole } from "@tms/shared";

const projectRoutes = Router();

projectRoutes.post("/",authenticate(),createHandler);
projectRoutes.get("/",authenticate(),listHandler);
projectRoutes.get("/project", authenticate(),listMyProjectsHandler);
projectRoutes.get("/supervised", authenticate([UserRole.Supervisor,UserRole.SupervisorAdmin,UserRole.Admin,UserRole.SuperAdmin]), listSupervisedProjectsHandler);
projectRoutes.put("/:id/staff", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), updateStaffHandler);
projectRoutes.put("/:id/activate", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), activateHandler);
projectRoutes.delete("/:id", authenticate([UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), deleteHandler);
export  {projectRoutes};
