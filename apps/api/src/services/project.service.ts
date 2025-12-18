import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import ProjectModel from '../models/project.model';
import { UserRole } from '@tms/shared';
import { CreateProjectParams } from '../interfaces/project';
import { appAssert } from '../utils';
import mongoose from 'mongoose';
import {UserModel} from '../models/user.model';
import TeamModel from '../models/team.model';
export const createProject = async (data: CreateProjectParams, performedBy?: string) => {
  const existingProject = await ProjectModel.exists({
    projectName: data.projectName,
  });

  appAssert(!existingProject, CONFLICT, 'Project already exists');

  const project = await ProjectModel.create({
    projectName: data.projectName,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    description: data.description,
    clientName: data.clientName,
    costCenter: data.costCenter,
    projectType: data.projectType,
    isPublic: data.isPublic,
    billable: data.billable,
    employees: data.employees?.map((emp) => new mongoose.Types.ObjectId(emp)),
    supervisor: data.supervisor ? new mongoose.Types.ObjectId(data.supervisor) : null,
    status: data.status ?? true,
  });

  appAssert(project, INTERNAL_SERVER_ERROR, 'Project creation failed');


  return {
    project,
  };
};

// List projects based on user role
export const listProjects = async (userId: string, userRole: UserRole) => {
  switch (userRole) {
    case UserRole.Emp:
    case UserRole.Supervisor: {
      const projects = await ProjectModel.find({ status: true, employees: userId })
        .sort({ createdAt: -1 })
        .populate({ path: 'employees', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { projects };
    }
    case UserRole.Admin:
    case UserRole.SupervisorAdmin:
    case UserRole.SuperAdmin: {
      const projects = await ProjectModel.find({ status: true })
        .sort({ createdAt: -1 })
        .populate({ path: 'employees', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      return { projects };
    }
    default:
      return { projects: [] };
  }
};

export const listMyProjects = async (userId: string) => {
  const projects = await ProjectModel.find({ status: true, employees: userId })
    .sort({ createdAt: -1 })
  return { projects };
};

export const updateProjectStaff = async (
  projectId: string,
  data: { employees?: string[]; supervisor?: string | null },
  performedBy?: string
) => {
  //get the previous supervisor and employees
  const existing = await ProjectModel.findById(projectId).select('supervisor employees projectName');
  const update: any = {};
  
  // Track employee changes for history logging
  const oldEmployeeIds = existing?.employees?.map(id => id.toString()) || [];
  const newEmployeeIds = data.employees?.filter(id => !!id) || oldEmployeeIds;
  
  if (Array.isArray(data.employees)) {
    update.employees = data.employees
      .filter((id) => !!id)
      .map((id) => new mongoose.Types.ObjectId(id));
  }
  if (data.supervisor !== undefined) {
    update.supervisor = data.supervisor
      ? new mongoose.Types.ObjectId(data.supervisor)
      : null;
  }
  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: update },
    { new: true }
  )
    .populate({ path: 'employees', select: 'firstName lastName email' })
    .populate({ path: 'supervisor', select: 'firstName lastName email' });
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project update failed');

  // Update roles based on supervisor change
  if (data.supervisor !== undefined) {
    const previousSupervisorId = existing?.supervisor?.toString() || null;
    const newSupervisorId = project.supervisor
      ? (project.supervisor as any)._id?.toString?.() || project.supervisor.toString()
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
    // Demote previous supervisor if changed or removed
    if (
      previousSupervisorId &&
      (previousSupervisorId !== newSupervisorId || !newSupervisorId)
    ) {
      const prev = await UserModel.findById(previousSupervisorId).select('role');
      
      if (prev) {
        if (prev.role === UserRole.SupervisorAdmin) {
          // For SupervisorAdmin: check if still supervising any other projects or teams
          const stillSupervisingAnotherProject = await ProjectModel.exists({
            _id: { $ne: projectId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          // Only demote to Admin if not supervising any other projects or teams
          if (!stillSupervisingAnotherProject && !stillSupervisingAnotherTeam) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Admin },
            });
          }
        } else if (prev.role === UserRole.Supervisor) {
          // For Supervisor: check if still supervising any other projects or teams
          const stillSupervisingAnotherProject = await ProjectModel.exists({
            _id: { $ne: projectId },
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          const stillSupervisingAnotherTeam = await TeamModel.exists({
            supervisor: new mongoose.Types.ObjectId(previousSupervisorId),
            status: true,
          });
          
          // Only demote to Emp if not supervising any other projects or teams
          if (!stillSupervisingAnotherProject && !stillSupervisingAnotherTeam) {
            await UserModel.findByIdAndUpdate(previousSupervisorId, {
              $set: { role: UserRole.Emp },
            });
          }
        }
      }
    }
  }
  return { project };
};

export const softDeleteProject = async (projectId: string, performedBy?: string) => {
  // Capture the current project data before deletion
  const existing = await ProjectModel.findById(projectId).select('supervisor employees projectName');

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: { status: false } },
    { new: true }
  );
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project delete failed');

  // Handle supervisor role management
  const supervisorId = existing?.supervisor?.toString();
  if (supervisorId) {
    const prev = await UserModel.findById(supervisorId).select('role');
    
    if (prev) {
      if (prev.role === UserRole.SupervisorAdmin) {
        // For SupervisorAdmin: check if still supervising any other projects or teams
        const stillSupervisingAnotherProject = await ProjectModel.exists({
          _id: { $ne: projectId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        // Only demote to Admin if not supervising any other projects or teams
        if (!stillSupervisingAnotherProject && !stillSupervisingAnotherTeam) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Admin },
          });
        }
      } else if (prev.role === UserRole.Supervisor) {
        // For Supervisor: check if still supervising any other projects or teams
        const stillSupervisingAnotherProject = await ProjectModel.exists({
          _id: { $ne: projectId },
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        const stillSupervisingAnotherTeam = await TeamModel.exists({
          supervisor: new mongoose.Types.ObjectId(supervisorId),
          status: true,
        });
        
        // Only demote to Emp if not supervising any other projects or teams
        if (!stillSupervisingAnotherProject && !stillSupervisingAnotherTeam) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Emp },
          });
        }
      }
    }
  }

  // Remove project from all users' teams array
  if (existing?.employees && existing.employees.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: existing.employees } },
      { $pull: { teams: new mongoose.Types.ObjectId(projectId) } }
    );
  }

  return { projectId };
};

export const listSupervisedProjects = async (supervisorId: string) => {
  const projects = await ProjectModel.find({ 
    supervisor: supervisorId, 
    status: true 
  })
    .select('_id projectName')
    .sort({ projectName: 1 });
  
  return { projects };
};
