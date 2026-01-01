import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import  appAssert  from '../utils/validation/appAssert';
import mongoose from 'mongoose';
import TeamModel from '../models/team.model';
import ProjectModel from '../models/project.model';
import {UserModel} from '../models/user.model';
import { UserRole } from '@tms/shared';
import { stringArrayToObjectIds, stringToObjectId} from '../utils/data/mongooseUtils';
import { filterValidIds } from '../utils/data/arrayUtils';
import { updateUserRoleOnSupervisorAssignment } from '../utils/auth';
import { updateUserTeamMemberships } from '../utils/data/assignmentUtils';
import { CreateTeamParams } from '../interfaces/team';
import { createHistoryLog, generateHistoryDescription } from '../utils/history';
import { HistoryActionType, HistoryEntityType } from '../interfaces/history';


export const createTeam = async (data: CreateTeamParams, createdBy?: string) => {
  
  
  const exists = await TeamModel.exists({ teamName: data.teamName });
  appAssert(!exists, CONFLICT, 'Team already exists');

  // Validate that all member IDs are valid MongoDB ObjectIds
  const memberIds = filterValidIds(data.members ?? []);
  const validMemberIds = memberIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  
  if (memberIds.length !== validMemberIds.length) {
    console.warn('Some member IDs are invalid MongoDB ObjectIds:', {
      original: memberIds,
      valid: validMemberIds
    });
  }

  // Validate supervisor ID if provided
  if (data.supervisor && !mongoose.Types.ObjectId.isValid(data.supervisor)) {
   
    throw new Error('Invalid supervisor ID');
  }

  const team = await TeamModel.create({
    teamName: data.teamName,
    members: stringArrayToObjectIds(validMemberIds),
    supervisor: stringToObjectId(data.supervisor),
    status: data.status ?? true,
    isDepartment: data.isDepartment ?? true,
  });

  appAssert(team, INTERNAL_SERVER_ERROR, 'Team creation failed');

  // Log history
  try {
    // Get the user who created this team (authenticated user)
    const creator = createdBy ? await UserModel.findById(createdBy) : null;
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'System';
    const creatorEmail = creator ? creator.email : 'system@timesync.com';
    
    await createHistoryLog({
      actionType: HistoryActionType.TEAM_CREATED,
      entityType: HistoryEntityType.TEAM,
      entityId: team._id,
      entityName: team.teamName,
      performedBy: createdBy || team._id,
      performedByName: creatorName,
      performedByEmail: creatorEmail,
      description: generateHistoryDescription(
        HistoryActionType.TEAM_CREATED,
        team.teamName
      ),
      metadata: {
        supervisor: data.supervisor ? (await UserModel.findById(data.supervisor))?.firstName + ' ' + (await UserModel.findById(data.supervisor))?.lastName : 'None',
        memberCount: validMemberIds.length,
        isDepartment: team.isDepartment,
      },
    });
  } catch (error) {
    console.error('Failed to create history log for team creation:', error);
  }

  try {
    // Update supervisor role if supervisor is assigned
    if (team.supervisor) {
      
      await updateUserRoleOnSupervisorAssignment(team.supervisor.toString());
    }

    // Update user team memberships if members are assigned
    if (validMemberIds.length > 0) {
      
      await updateUserTeamMemberships(team._id.toString(), validMemberIds);
    }
  } catch (error) {
    // Ignore errors in team membership updates
    console.error('Error updating team memberships:', error);
  }

  return { team };
};

export const listTeams = async () => {
  const teams = await TeamModel.find({ status: true })
    .sort({ createdAt: -1 })
    .populate({ path: 'members', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
  return { teams };
};

export const listTeamsForUser = async (userId: string, userRole: UserRole) => {
  switch (userRole) {
    case UserRole.Emp:
    case UserRole.Supervisor: {
      const teams = await TeamModel.find({ status: true, members: userId })
        .sort({ createdAt: -1 })
        .populate({ path: 'members', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { teams };
    }
    case UserRole.Admin:
    case UserRole.SupervisorAdmin:
    case UserRole.SuperAdmin: {
      const teams = await TeamModel.find({ status: true })
        .sort({ createdAt: -1 })
        .populate({ path: 'members', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { teams };
    }
    default:
      return { teams: [] };
  }
};

export const listMyMemberTeams = async (userId: string) => {
  // Only return teams where isDepartment is true (or not set, for backward compatibility)
  const teams = await TeamModel.find({ 
    status: true, 
    members: userId,
    $or: [
      { isDepartment: true },
      { isDepartment: { $exists: false } }
    ]
  })
    .sort({ createdAt: -1 })
    .populate({ path: 'members', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
  return { teams };
};

export const listSupervisedTeams = async (supervisorId: string) => {
  // Only return teams where isDepartment is true (or not set, for backward compatibility)
  const teams = await TeamModel.find({ 
    supervisor: supervisorId, 
    status: true,
    $or: [
      { isDepartment: true },
      { isDepartment: { $exists: false } }
    ]
  })
    .select('_id teamName')
    .sort({ teamName: 1 });
  
  return { teams };
};

export const listAllSupervisedTeams = async (supervisorId: string) => {
  // Return ALL teams (including non-departments) for approval permissions
  const teams = await TeamModel.find({ 
    supervisor: supervisorId, 
    status: true
  })
    .select('_id teamName members')
    .populate('members', '_id')
    .sort({ teamName: 1 });
  
  return { teams };
};

export const updateTeamStaff = async (
  teamId: string,
  data: { members?: string[]; supervisor?: string | null },
  performedBy?: string
) => {
  const existing = await TeamModel.findById(teamId)
    .select('supervisor members teamName')
    .populate('supervisor', 'firstName lastName')
    .populate('members', 'firstName lastName');
  const update: any = {};
  
  const oldMemberIds = existing?.members?.map((m: any) => m._id.toString()) || [];
  const newMemberIds = data.members?.filter((id) => !!id) || [];
  
  if (Array.isArray(data.members)) {
    update.members = data.members
      .filter((id) => !!id)
      .map((id) => new mongoose.Types.ObjectId(id));
  }
  
  if (data.supervisor !== undefined) {
    update.supervisor = data.supervisor
      ? new mongoose.Types.ObjectId(data.supervisor)
      : null;
  }
  
  const team = await TeamModel.findByIdAndUpdate(
    teamId,
    { $set: update },
    { new: true }
  )
    .populate({ path: 'members', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
    
  appAssert(team, INTERNAL_SERVER_ERROR, 'Team update failed');

  // Update user team memberships if members were changed
  if (Array.isArray(data.members)) {
    // Use the oldMemberIds and newMemberIds already defined above (lines 187-188)
    console.log('Team update - Updating user team memberships');
    console.log('Team ID:', teamId);
    console.log('Old members:', oldMemberIds);
    console.log('New members:', newMemberIds);
    
    try {
      await updateUserTeamMemberships(teamId, newMemberIds, oldMemberIds);
      console.log('User team memberships updated successfully');
    } catch (error) {
      console.error('ERROR: Failed to update user team memberships:', error);
      // Log the full error details
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Don't throw error - team update was successful, just log the membership sync issue
      console.warn('Team was updated successfully, but user team membership sync failed. This may need manual correction.');
    }
  } else {
    console.log('Team update - Members array not provided, skipping user team membership updates');
  }

  if (data.supervisor !== undefined) {
    const previousSupervisorId = existing?.supervisor 
      ? (existing.supervisor as any)._id?.toString() || null 
      : null;
    const newSupervisorId = team.supervisor
      ? (team.supervisor as any)._id?.toString?.() || team.supervisor.toString()
      : null;

    if (newSupervisorId && previousSupervisorId !== newSupervisorId) {
      const sup = await UserModel.findById(newSupervisorId).select('role firstName lastName');
      if (sup) {
        if (sup.role === UserRole.Admin) {
          await UserModel.findByIdAndUpdate(newSupervisorId, {
            $set: { role: UserRole.SupervisorAdmin },
          });
        } else if (sup.role === UserRole.Emp) {
          await UserModel.findByIdAndUpdate(newSupervisorId, {
            $set: { role: UserRole.Supervisor },
          });
        }
      }
    }
    
    if (
      previousSupervisorId &&
      (previousSupervisorId !== newSupervisorId || !newSupervisorId)
    ) {
      const prev = await UserModel.findById(previousSupervisorId).select('role');
      
      if (prev) {
        if (prev.role === UserRole.SupervisorAdmin) {
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            _id: { $ne: teamId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          if (!stillSupervisingAnotherTeam) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Admin },
            });
          }
        } else if (prev.role === UserRole.Supervisor) {
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            _id: { $ne: teamId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          const stillSupervisingAnotherProject = await ProjectModel.exists({
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          if (!stillSupervisingAnotherTeam && !stillSupervisingAnotherProject) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Emp },
            });
          }
        }
      }
    }
  }
  
  return { team };
};

export const deleteTeam = async (teamId: string) => {
  const existing = await TeamModel.findById(teamId).select('supervisor members teamName');

  const team = await TeamModel.findByIdAndUpdate(
    teamId,
    { $set: { status: false } },
    { new: true }
  );
  appAssert(team, INTERNAL_SERVER_ERROR, 'Team delete failed');

 

  const supervisorId = existing?.supervisor?.toString();
  if (supervisorId) {
    const prev = await UserModel.findById(supervisorId).select('role');
    
    if (prev) {
      if (prev.role === UserRole.SupervisorAdmin) {
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          _id: { $ne: teamId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        if (!stillSupervisingAnotherTeam) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Admin },
          });
        }
      } else if (prev.role === UserRole.Supervisor) {
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          _id: { $ne: teamId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        const stillSupervisingAnotherProject = await ProjectModel.exists({
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        if (!stillSupervisingAnotherTeam && !stillSupervisingAnotherProject) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Emp },
          });
        }
      }
    }
  }

  if (existing?.members && existing.members.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: existing.members } },
      { $pull: { teams: new mongoose.Types.ObjectId(teamId) } }
    );
  }

  return { teamId };
};


