import { Router } from 'express';
import { createMyTimesheetHandler } from '../controllers';

const timesheetRoutes = Router();

timesheetRoutes.post('/', createMyTimesheetHandler);

export { timesheetRoutes };
