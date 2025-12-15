import { Router } from 'express';
import { createHandler, listHandler, listMyProjectsHandler } from '../controllers/project.controller';
import authenticate from '../middleware/authenticate';

const projectRoutes = Router();

projectRoutes.post("/",authenticate(),createHandler);
projectRoutes.get("/",authenticate,listHandler);
projectRoutes.get("/my-projects", authenticate(),listMyProjectsHandler);

export  {projectRoutes};
