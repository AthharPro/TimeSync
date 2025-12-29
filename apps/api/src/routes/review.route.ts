import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import { 
  getSupervisedEmployeesForReviewHandler, 
  getEmployeeTimesheetsForReviewHandler,
  approveTimesheetsHandler,
  rejectTimesheetsHandler,
  updateEmployeeTimesheetHandler
} from '../controllers/review.controller';

const reviewRoutes = Router();

const supervisorRoles = [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin];

// Get employees that the supervisor can review timesheets for
reviewRoutes.get('/employees', authenticate(supervisorRoles), getSupervisedEmployeesForReviewHandler);

// Get timesheets for a specific employee
reviewRoutes.get('/employees/:employeeId/timesheets', authenticate(supervisorRoles), getEmployeeTimesheetsForReviewHandler);

// Update an employee's timesheet
reviewRoutes.put('/timesheets/:timesheetId', authenticate(supervisorRoles), updateEmployeeTimesheetHandler);

// Approve timesheets
reviewRoutes.post('/timesheets/approve', authenticate(supervisorRoles), approveTimesheetsHandler);

// Reject timesheets
reviewRoutes.post('/timesheets/reject', authenticate(supervisorRoles), rejectTimesheetsHandler);

export default reviewRoutes;
