import { Router } from 'express';
import { createTeamHandler, listTeamsHandler, listTeamsForUserHandler, listMyMemberTeamsHandler, listSupervisedTeamsHandler, listAllSupervisedTeamsHandler, updateStaffHandler, updateTeamDetailsHandler, deleteTeamHandler} from '../controllers/team.controller';
import authenticate from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createTeamSchema, updateTeamStaffSchema } from '../schemas/team.schema';
import { UserRole } from '@tms/shared';

const teamRoutes = Router();

teamRoutes.post('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), validate(createTeamSchema), createTeamHandler);
teamRoutes.get('/', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), listTeamsHandler);
teamRoutes.put('/:id', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), updateTeamDetailsHandler);
teamRoutes.put('/:id/staff', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), validate(updateTeamStaffSchema), updateStaffHandler);
teamRoutes.delete('/:id', authenticate([UserRole.Admin, UserRole.SupervisorAdmin]), deleteTeamHandler);
teamRoutes.get('/my-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listTeamsForUserHandler);
teamRoutes.get('/my-member-teams', authenticate([UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listMyMemberTeamsHandler);
teamRoutes.get('/supervised', authenticate([UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listSupervisedTeamsHandler);
teamRoutes.get('/supervised-all', authenticate([UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin, UserRole.SuperAdmin]), listAllSupervisedTeamsHandler);

export default teamRoutes;


