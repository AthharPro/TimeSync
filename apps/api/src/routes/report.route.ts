import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import {
  getReportMetadataHandler,
  getSupervisedEmployeesHandler,
  generateDetailedTimesheetReportHandler,
  generateTimesheetEntriesReportHandler,
} from '../controllers/report.controller';

const reportRoutes = Router();

const supervisorRoles = [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin];

reportRoutes.get('/metadata', authenticate(supervisorRoles), getReportMetadataHandler);
reportRoutes.get('/supervised-employees', authenticate(supervisorRoles), getSupervisedEmployeesHandler);
reportRoutes.get('/detailed-timesheet', authenticate(supervisorRoles), generateDetailedTimesheetReportHandler);
reportRoutes.get('/timesheet-entries', authenticate(supervisorRoles), generateTimesheetEntriesReportHandler);

export default reportRoutes;





