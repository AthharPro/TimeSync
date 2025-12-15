import { Router } from 'express';
import { createMyTimesheetHandler, updateMyTimesheetHandler, getMyTimesheetsHandler, submitTimesheetsHandler } from '../controllers';
import authenticate from '../middleware/authenticate';

const timesheetRoutes = Router();

timesheetRoutes.get('/', authenticate(), getMyTimesheetsHandler);
timesheetRoutes.post('/', authenticate(), createMyTimesheetHandler);
timesheetRoutes.put('/:id', authenticate(), updateMyTimesheetHandler);
timesheetRoutes.post('/submit', authenticate(), submitTimesheetsHandler);

export { timesheetRoutes };
