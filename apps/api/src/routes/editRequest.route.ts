import { Router } from 'express';
import { 
  createEditRequestHandler, 
  getMyEditRequestsHandler, 
  getSupervisedEditRequestsHandler,
  approveEditRequestHandler,
  rejectEditRequestHandler,
  checkEditPermissionHandler
} from '../controllers';
import authenticate from '../middleware/authenticate';

const editRequestRoutes = Router();

// Employee routes - create and view own edit requests
editRequestRoutes.post('/', authenticate(), createEditRequestHandler);
editRequestRoutes.get('/my', authenticate(), getMyEditRequestsHandler);

// Check if user has edit permission for a specific month
editRequestRoutes.get('/check-permission', authenticate(), checkEditPermissionHandler);

// Supervisor routes - view, approve, and reject edit requests from supervised employees
editRequestRoutes.get('/supervised', authenticate(), getSupervisedEditRequestsHandler);
editRequestRoutes.post('/approve', authenticate(), approveEditRequestHandler);
editRequestRoutes.post('/reject', authenticate(), rejectEditRequestHandler);

export { editRequestRoutes };
