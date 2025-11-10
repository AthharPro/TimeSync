import UserModel from '../../models/user.model';
import ProjectModel from '../../models/project.model';
import TeamModel from '../../models/team.model';
import { UserRole } from '@tms/shared';

export const updateUserRoleOnSupervisorAssignment = async (supervisorId: string): Promise<void> => {
  const supervisor = await UserModel.findById(supervisorId).select('role');
  if (!supervisor) return;

  let newRole: UserRole | undefined;

  if (supervisor.role === UserRole.Admin) {
    newRole = UserRole.SupervisorAdmin;
  } else if (supervisor.role === UserRole.Emp) {
    newRole = UserRole.Supervisor;
  }

  if (newRole) {
    await UserModel.findByIdAndUpdate(supervisorId, { $set: { role: newRole } });
  }
};

export const checkAndDowngradeUserRole = async (userId: string): Promise<void> => {
  const user = await UserModel.findById(userId).select('role');
  if (!user || (user.role !== UserRole.Supervisor && user.role !== UserRole.SupervisorAdmin)) {
    return;
  }

  const isSupervisorOfProject = await ProjectModel.exists({ supervisor: userId, status: true });
  const isSupervisorOfTeam = await TeamModel.exists({ supervisor: userId, status: true });

  if (!isSupervisorOfProject && !isSupervisorOfTeam) {
    // Downgrade role
    const newRole = user.role === UserRole.SupervisorAdmin ? UserRole.Admin : UserRole.Emp;
    await UserModel.findByIdAndUpdate(userId, { $set: { role: newRole } });
  }
};


export const getUsersByAccessLevel = (userRole: UserRole) => {
  const accessLevelMap = {
    [UserRole.Emp]: [UserRole.Emp],
    [UserRole.Supervisor]: [UserRole.Emp, UserRole.Supervisor],
    [UserRole.Admin]: [UserRole.Emp, UserRole.Supervisor, UserRole.Admin],
    [UserRole.SupervisorAdmin]: [UserRole.Emp, UserRole.Supervisor, UserRole.Admin, UserRole.SupervisorAdmin],
    [UserRole.SuperAdmin]: Object.values(UserRole),
  };

  return accessLevelMap[userRole] || [];
};
