import { Router } from 'express';
import { createTaskHandler, getTasksByProjectHandler } from '../controllers';
import authenticate from '../middleware/authenticate';

const taskRoutes = Router();

taskRoutes.post('/', authenticate(), createTaskHandler);
taskRoutes.get('/project/:projectId', authenticate(), getTasksByProjectHandler);

export { taskRoutes };