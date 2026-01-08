import ProjectModel from '../../models/project.model';
import TeamModel from '../../models/team.model';
import {UserModel} from '../../models/user.model';
import mongoose from 'mongoose';

export const isEmployeeAssignedToProjectOrTeam = async (userId: string): Promise<boolean> => {
  try {
    const assignedToProject = await ProjectModel.findOne({
      employees: userId,
      status: true,
    });

    if (assignedToProject) return true;

    const assignedToTeam = await TeamModel.findOne({
      members: userId,
      status: true,
    });

    if (assignedToTeam) return true;

    const supervisorOfTeam = await TeamModel.findOne({
      supervisor: userId,
      status: true,
    });

    if (supervisorOfTeam) return true;

    const supervisorOfProject = await ProjectModel.findOne({
      supervisor: userId,
      status: true,
    });

    return !!supervisorOfProject;
  } catch {
   
    return false;
  }
};

export const getSupervisedUserIds = async (supervisorId: string): Promise<string[]> => {

  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId }).lean();
  const projectSupervisedUserIds = Array.from(
    new Set(
      supervisedProjects.flatMap(p => {
        if (!p.employees) return [];
        return p.employees.map(e => {
          // Handle employee objects that have 'user' field (new structure)
          if (e && typeof e === 'object' && 'user' in e) {
            const user = e.user;
            if (typeof user === 'string') return user;
            if (user && typeof user === 'object' && '_id' in user) return user._id.toString();
            return user.toString();
          }
          // Handle direct user references (old structure, for backward compatibility)
          if (typeof e === 'string') return e;
          if (e && typeof e === 'object' && '_id' in e) return e._id.toString();
          return e.toString();
        });
      })
    )
  );

  // Include ALL teams (both department and non-department) to determine supervised users
  // Non-department teams allow supervisors to see and approve project/department timesheets of their members
  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId }).lean();
  const teamSupervisedUserIds = Array.from(
    new Set(
      supervisedTeams.flatMap(t => {
        if (!t.members) return [];
        return t.members.map(m => {
          // Handle both ObjectId and populated User objects
          if (typeof m === 'string') return m;
          if (m && typeof m === 'object' && '_id' in m) return m._id.toString();
          return m.toString();
        });
      })
    )
  );

  return Array.from(
    new Set([...projectSupervisedUserIds, ...teamSupervisedUserIds])
  );
};

/**
 * Get employee IDs from non-department teams (isDepartment: false) supervised by a supervisor
 * These employees' ALL timesheets can be approved/rejected/edited by the supervisor
 * regardless of which project/team the timesheet belongs to
 */
export const getNonDepartmentTeamEmployeeIds = async (supervisorId: string): Promise<string[]> => {
  const nonDepartmentTeams = await TeamModel.find({ 
    supervisor: supervisorId,
    isDepartment: false 
  }).lean();
  
  const employeeIds = Array.from(
    new Set(
      nonDepartmentTeams.flatMap(t => {
        if (!t.members) return [];
        return t.members.map(m => {
          // Handle both ObjectId and populated User objects
          if (typeof m === 'string') return m;
          if (m && typeof m === 'object' && '_id' in m) return m._id.toString();
          return m.toString();
        });
      })
    )
  );
  
  return employeeIds;
};

/**
 * Get the project IDs and team IDs that a supervisor supervises
 * Used to verify if a supervisor has permission to approve/reject/edit specific timesheets
 */
export const getSupervisedProjectAndTeamIds = async (supervisorId: string): Promise<{
  projectIds: string[];
  teamIds: string[];
}> => {
  const supervisedProjects = await ProjectModel.find({ supervisor: supervisorId });
  const projectIds = supervisedProjects.map(p => p._id.toString());

  const supervisedTeams = await TeamModel.find({ supervisor: supervisorId });
  const teamIds = supervisedTeams.map(t => t._id.toString());

  return {
    projectIds,
    teamIds,
  };
};

export const updateUserTeamMemberships = async (
  teamId: string, 
  newMembers: string[], 
  oldMembers: string[] = []
): Promise<void> => {
  console.log('updateUserTeamMemberships called with:', { teamId, newMembers, oldMembers });
    
  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  
  const membersToAdd = newMembers.filter(id => !oldMembers.includes(id));
  if (membersToAdd.length > 0) {
    console.log('Adding members to team:', membersToAdd);
    const addResult = await UserModel.updateMany(
      { _id: { $in: membersToAdd.map(id => new mongoose.Types.ObjectId(id)) } },
      { $addToSet: { teams: teamObjectId } }
    );
    console.log('Add members result:', { 
      matchedCount: addResult.matchedCount, 
      modifiedCount: addResult.modifiedCount,
      acknowledged: addResult.acknowledged 
    });
  }

  const membersToRemove = oldMembers.filter(id => !newMembers.includes(id));
  if (membersToRemove.length > 0) {
    console.log('Removing members from team:', membersToRemove);
    const removeResult = await UserModel.updateMany(
      { _id: { $in: membersToRemove.map(id => new mongoose.Types.ObjectId(id)) } },
      { $pull: { teams: teamObjectId } }
    );
    console.log('Remove members result:', { 
      matchedCount: removeResult.matchedCount, 
      modifiedCount: removeResult.modifiedCount,
      acknowledged: removeResult.acknowledged 
    });
  }
  
  console.log('updateUserTeamMemberships completed');
};

/**
 * Get supervisors who should be notified when a user submits timesheets
 * Returns supervisors from projects and teams that the user is assigned to
 */
export const getSupervisorsForUser = async (userId: string): Promise<string[]> => {
  const supervisorIds = new Set<string>();

  // Get supervisors from projects where user is assigned
  const projects = await ProjectModel.find({ 
    'employees.user': userId,
    status: true 
  }).select('supervisor').lean();

  projects.forEach(project => {
    if (project.supervisor) {
      supervisorIds.add(project.supervisor.toString());
    }
  });

  // Get supervisors from teams where user is a member
  const teams = await TeamModel.find({ 
    members: userId,
    status: true 
  }).select('supervisor').lean();

  teams.forEach(team => {
    if (team.supervisor) {
      supervisorIds.add(team.supervisor.toString());
    }
  });

  return Array.from(supervisorIds);
};

/**
 * Get supervisors from specific timesheets
 * Returns supervisors from:
 * 1. Projects referenced in the timesheets
 * 2. Teams referenced in the timesheets
 * 3. ALL teams that the employee is a member of (especially important for isDepartment:false teams)
 */
export const getSupervisorsForTimesheets = async (timesheets: Array<{ projectId?: any; teamId?: any; userId?: any }>): Promise<string[]> => {
  const supervisorIds = new Set<string>();

  // Extract unique project and team IDs from timesheets
  const projectIds = new Set<string>();
  const teamIds = new Set<string>();
  const userIds = new Set<string>();

  timesheets.forEach(timesheet => {
    if (timesheet.projectId) {
      projectIds.add(timesheet.projectId.toString());
    }
    if (timesheet.teamId) {
      teamIds.add(timesheet.teamId.toString());
    }
    if (timesheet.userId) {
      userIds.add(timesheet.userId.toString());
    }
  });

  // Get supervisors from the projects in these timesheets
  if (projectIds.size > 0) {
    const projects = await ProjectModel.find({
      _id: { $in: Array.from(projectIds) },
      status: true
    }).select('supervisor').lean();

    projects.forEach(project => {
      if (project.supervisor) {
        supervisorIds.add(project.supervisor.toString());
      }
    });
  }

  // Get supervisors from the teams in these timesheets
  if (teamIds.size > 0) {
    const teams = await TeamModel.find({
      _id: { $in: Array.from(teamIds) },
      status: true
    }).select('supervisor').lean();

    teams.forEach(team => {
      if (team.supervisor) {
        supervisorIds.add(team.supervisor.toString());
      }
    });
  }

  // IMPORTANT: Also get supervisors from ALL teams the employee(s) are members of
  // This ensures that supervisors of isDepartment:false teams get notified
  // even when the timesheet doesn't directly reference their team
  if (userIds.size > 0) {
    const employeeTeams = await TeamModel.find({
      members: { $in: Array.from(userIds) },
      status: true
    }).select('supervisor').lean();

    employeeTeams.forEach(team => {
      if (team.supervisor) {
        supervisorIds.add(team.supervisor.toString());
      }
    });
  }

  return Array.from(supervisorIds);
};

