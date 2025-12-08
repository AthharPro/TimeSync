import { Router } from 'express';
import { createMyTimesheetHandler,updateTimesheetHandler } from '../controllers';

const timesheetRoutes = Router();

timesheetRoutes.post('/', createMyTimesheetHandler);
timesheetRoutes.patch('/:id', updateTimesheetHandler);

export { timesheetRoutes };
