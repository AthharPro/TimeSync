import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import ProjectModel from '../models/project.model';
import { UserRole } from '@tms/shared';
import { CreateProjectParams } from '../interfaces/project';
import { appAssert } from '../utils';
import mongoose from 'mongoose';
import {UserModel} from '../models/user.model';
import TeamModel from '../models/team.model';
import { createHistoryLog, generateHistoryDescription } from '../utils/history';
import { HistoryActionType, HistoryEntityType } from '../interfaces/history';
export const createProject = async (data: CreateProjectParams, createdBy?: string) => {
  const existingProject = await ProjectModel.exists({
    projectName: data.projectName,
  });

  appAssert(!existingProject, CONFLICT, 'Project already exists');

  const employeesArray = (data.employees || []).map((emp) => {
    const rawAlloc = (emp as any).allocation;
    const allocation = typeof rawAlloc !== 'undefined' && rawAlloc !== null ? Number(rawAlloc) : undefined;
    const mapped: any = {
      user: new mongoose.Types.ObjectId((emp as any).user ?? emp),
    };
    if (typeof allocation === 'number' && !Number.isNaN(allocation)) mapped.allocation = allocation;
    return mapped;
  });

  // eslint-disable-next-line no-console
  console.debug('createProject - mapped employees:', employeesArray);

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
    employees: employeesArray,
    supervisor: data.supervisor ? new mongoose.Types.ObjectId(data.supervisor) : null,
    status: data.status ?? true,
  });

  appAssert(project, INTERNAL_SERVER_ERROR, 'Project creation failed');

  // Create history log
  try {
    // Get the user who created this project (authenticated user)
    const creator = createdBy ? await UserModel.findById(createdBy) : null;
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'System';
    const creatorEmail = creator ? creator.email : 'system@timesync.com';
    
    await createHistoryLog({
      actionType: HistoryActionType.PROJECT_CREATED,
      entityType: HistoryEntityType.PROJECT,
      entityId: project._id,
      entityName: project.projectName,
      performedBy: createdBy || project._id,
      performedByName: creatorName,
      performedByEmail: creatorEmail,
      description: generateHistoryDescription(
        HistoryActionType.PROJECT_CREATED,
        project.projectName
      ),
      metadata: {
        isPublic: project.isPublic,
        supervisor: data.supervisor ? (await UserModel.findById(data.supervisor))?.firstName + ' ' + (await UserModel.findById(data.supervisor))?.lastName : 'None',
        employeeCount: data.employees?.length || 0,
      },
    });
  } catch (error) {
  }

  // Update supervisor role if a supervisor was assigned during project creation
  try {
    if (data.supervisor) {
      const supervisor = await UserModel.findById(data.supervisor).select('role');
      if (supervisor) {
        // If the user is an Admin, promote to SupervisorAdmin
        if (supervisor.role === UserRole.Admin) {
          await UserModel.findByIdAndUpdate(data.supervisor, {
            $set: { role: UserRole.SupervisorAdmin },
          });
        } 
        // If the user is an Emp, promote to Supervisor
        else if (supervisor.role === UserRole.Emp) {
          await UserModel.findByIdAndUpdate(data.supervisor, {
            $set: { role: UserRole.Supervisor },
          });
        }
      }
    }
  } catch (error) {
  }

  return {
    project,
  };
};

// List projects based on user role
export const listProjects = async (userId: string, userRole: UserRole) => {
  switch (userRole) {
    case UserRole.Emp:
    case UserRole.Supervisor: {

      const projects = await ProjectModel.find({ 
        $or: [
          { 'employees.user': new mongoose.Types.ObjectId(userId) }, // Private projects where user is assigned
          { isPublic: true }      // Public projects (all users can add time)
        ]
      })
        .sort({ createdAt: -1 })
        .populate({ path: 'employees.user', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      
      const teams = await TeamModel.find({
        $and: [
          { members: new mongoose.Types.ObjectId(userId) },
          { status: true },
          {
            $or: [
              { isDepartment: true },
              { isDepartment: { $exists: false } } // For backward compatibility
            ]
          }
        ]
      })
        .sort({ createdAt: -1 })
        .select('_id teamName isDepartment');
      
      return { projects, teams };
    }
    case UserRole.SupervisorAdmin:
    case UserRole.Admin:
    case UserRole.SuperAdmin: {
      // Admin/SupervisorAdmin/SuperAdmin can see ALL projects in the Projects window
      const projects = await ProjectModel.find({})
        .sort({ createdAt: -1 })
        .populate({ path: 'employees.user', select: 'firstName lastName email designation' })
        .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
      
      // For their own timesheets, they should only see teams where they are members
      // Non-department teams (isDepartment: false) are for grouping users for review purposes only
      const teams = await TeamModel.find({ 
        $and: [
          { members: new mongoose.Types.ObjectId(userId) },
          { status: true },
          {
            $or: [
              { isDepartment: true },
              { isDepartment: { $exists: false } } // For backward compatibility
            ]
          }
        ]
      })
        .sort({ createdAt: -1 })
        .select('_id teamName isDepartment');
      
      return { projects, teams };
    }
    default:
      return { projects: [], teams: [] };
  }
};

export const listMyProjects = async (userId: string) => {
  // Find projects where user is an employee (private projects) OR public projects
  const projects = await ProjectModel.find({ 
    status: true, 
    $or: [
      { 'employees.user': new mongoose.Types.ObjectId(userId) }, // Private projects where user is assigned
      { isPublic: true }      // Public projects (all users can add time)
    ]
  })
    .sort({ createdAt: -1 })
  
  // Also find teams where user is a member AND isDepartment is true
  // Only department teams (isDepartment: true) should be available for timesheet entry
  const teams = await TeamModel.find({
    status: true,
    members: new mongoose.Types.ObjectId(userId),
    $or: [
      { isDepartment: true },
      { isDepartment: { $exists: false } } // For backward compatibility
    ]
  })
    .sort({ createdAt: -1 })
    .select('_id teamName isDepartment');
  
  return { projects, teams };
};

export const updateProjectStaff = async (
  projectId: string,
  data: { employees?: { user: string; allocation?: number }[]; supervisor?: string | null },
  performedBy?: string
) => {
  //get the previous supervisor and employees
  const existing = await ProjectModel.findById(projectId)
    .select('supervisor employees projectName')
    .populate('supervisor', 'firstName lastName')
    .populate('employees', 'firstName lastName');
  
  // Prevent editing the "Internal" project
  appAssert(
    existing?.projectName !== 'Internal',
    CONFLICT,
    'The Internal project cannot be edited'
  );
  const update: any = {};
  
  const oldEmployeeIds = existing?.employees?.map((e: any) => e._id.toString()) || [];
  const newEmployeeIds = data.employees?.filter((id) => !!id) || [];

  if (Array.isArray(data.employees)) {
    update.employees = data.employees
      .filter((e) => !!e && ((e as any).user || e))
      .map((e) => {
        const rawAlloc = (e as any).allocation;
        const allocation = typeof rawAlloc !== 'undefined' && rawAlloc !== null ? Number(rawAlloc) : undefined;
        const mapped: any = {
          user: new mongoose.Types.ObjectId((e as any).user ?? e),
        };
        if (typeof allocation === 'number' && !Number.isNaN(allocation)) mapped.allocation = allocation;
        return mapped;
      });
    // debug log: mapped employees
    // eslint-disable-next-line no-console
    console.debug('updateProjectStaff - mapped employees:', update.employees);
  }
  if (data.supervisor !== undefined) {
    // Handle empty string as null (supervisor removal)
    const supervisorValue = data.supervisor && data.supervisor.trim() !== '' ? data.supervisor : null;
    update.supervisor = supervisorValue
      ? new mongoose.Types.ObjectId(supervisorValue)
      : null;
  }
  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: update },
    { new: true }
  )
    .populate({ path: 'employees.user', select: 'firstName lastName email' })
    .populate({ path: 'supervisor', select: 'firstName lastName email' });
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project update failed');

  // Create history logs
  try {
    const actor = performedBy ? await UserModel.findById(performedBy) : null;
    const actorId = performedBy || project._id;
    const actorName = actor ? `${actor.firstName} ${actor.lastName}` : 'System';
    const actorEmail = actor ? actor.email : 'system@timesync.com';

    // Log supervisor change
    if (data.supervisor !== undefined) {
      const previousSupervisorId = existing?.supervisor?.toString() || null;
      const newSupervisorId = project.supervisor
        ? (project.supervisor as any)._id?.toString?.() || project.supervisor.toString()
        : null;

      if (previousSupervisorId !== newSupervisorId) {
        const newSupervisor = newSupervisorId ? await UserModel.findById(newSupervisorId) : null;
        const newSupervisorName = newSupervisor ? `${newSupervisor.firstName} ${newSupervisor.lastName}` : 'None';

        await createHistoryLog({
          actionType: HistoryActionType.PROJECT_SUPERVISOR_CHANGED,
          entityType: HistoryEntityType.PROJECT,
          entityId: project._id,
          entityName: project.projectName,
          performedBy: actorId,
          performedByName: actorName,
          performedByEmail: actorEmail,
          description: generateHistoryDescription(
            HistoryActionType.PROJECT_SUPERVISOR_CHANGED,
            project.projectName,
            { newSupervisorName }
          ),
          metadata: {
            oldSupervisorId: previousSupervisorId,
            newSupervisorId,
            newSupervisorName,
          },
        });
      }
    }

    // Log employee additions
    if (Array.isArray(data.employees)) {
      const addedEmployees = newEmployeeIds.filter((id) => !oldEmployeeIds.includes(id));
      for (const empId of addedEmployees) {
        const employee = await UserModel.findById(empId);
        if (employee) {
          await createHistoryLog({
            actionType: HistoryActionType.PROJECT_EMPLOYEE_ADDED,
            entityType: HistoryEntityType.PROJECT,
            entityId: project._id,
            entityName: project.projectName,
            performedBy: actorId,
            performedByName: actorName,
            performedByEmail: actorEmail,
            description: generateHistoryDescription(
              HistoryActionType.PROJECT_EMPLOYEE_ADDED,
              project.projectName,
              { employeeName: `${employee.firstName} ${employee.lastName}` }
            ),
            metadata: { employeeId: empId, employeeName: `${employee.firstName} ${employee.lastName}` },
          });
        }
      }

      // Log employee removals
      const removedEmployees = oldEmployeeIds.filter((id) => !newEmployeeIds.includes(id));
      for (const empId of removedEmployees) {
        const employee = await UserModel.findById(empId);
        if (employee) {
          await createHistoryLog({
            actionType: HistoryActionType.PROJECT_EMPLOYEE_REMOVED,
            entityType: HistoryEntityType.PROJECT,
            entityId: project._id,
            entityName: project.projectName,
            performedBy: actorId,
            performedByName: actorName,
            performedByEmail: actorEmail,
            description: generateHistoryDescription(
              HistoryActionType.PROJECT_EMPLOYEE_REMOVED,
              project.projectName,
              { employeeName: `${employee.firstName} ${employee.lastName}` }
            ),
            metadata: { employeeId: empId, employeeName: `${employee.firstName} ${employee.lastName}` },
          });
        }
      }
    }
  } catch (error) {
  }

  // Update roles based on supervisor change
  try {
    if (data.supervisor !== undefined) {
      const previousSupervisorId = existing?.supervisor?._id?.toString() || existing?.supervisor?.toString() || null;
      const newSupervisorId = project.supervisor
        ? (project.supervisor as any)._id?.toString?.() || project.supervisor.toString()
        : null;

      // Promote new supervisor if assigned
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
          } else {
          }
        }
      }

      // Demote previous supervisor if changed or removed
      if (previousSupervisorId && previousSupervisorId !== newSupervisorId) {
        const prev = await UserModel.findById(previousSupervisorId).select('role');
        
        if (prev) {
          
          if (prev.role === UserRole.SupervisorAdmin || prev.role === UserRole.Supervisor) {
            // Check if still supervising any other active projects (excluding current project)
            const otherProjects = await ProjectModel.find({
              _id: { $ne: projectId },
              supervisor: previousSupervisorId,
              status: true,
            }).select('_id projectName');
            
            // Check if still supervising any active teams
            const teams = await TeamModel.find({
              supervisor: previousSupervisorId,
              status: true,
            }).select('_id teamName');
            

            // Only demote if not supervising any other projects or teams
            if (otherProjects.length === 0 && teams.length === 0) {
              if (prev.role === UserRole.SupervisorAdmin) {
                await UserModel.findByIdAndUpdate(previousSupervisorId, {
                  $set: { role: UserRole.Admin },
                });
              } else if (prev.role === UserRole.Supervisor) {
                await UserModel.findByIdAndUpdate(previousSupervisorId, {
                  $set: { role: UserRole.Emp },
                });
              }
            } else {
            }
          } else {
          }
        } else {
        }
      } else if (!previousSupervisorId) {
      } else {
      }
    }
  } catch (error) {
  }

  return { project };
};

// Update project details (excluding staff/employees)
export const updateProjectDetails = async (
  projectId: string,
  data: {
    projectName?: string;
    description?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    clientName?: string;
    costCenter?: string;
    projectType?: string;
    isPublic?: boolean;
    billable?: string;
  },
  performedBy?: string
) => {
  const existing = await ProjectModel.findById(projectId);
  appAssert(existing, INTERNAL_SERVER_ERROR, 'Project not found');

  // Prevent editing the "Internal" project
  appAssert(
    existing.projectName !== 'Internal',
    CONFLICT,
    'The Internal project cannot be edited'
  );

  const update: any = {};
  
  if (data.projectName !== undefined) update.projectName = data.projectName;
  if (data.description !== undefined) update.description = data.description;
  if (data.startDate !== undefined) update.startDate = data.startDate;
  if (data.endDate !== undefined) update.endDate = data.endDate;
  if (data.clientName !== undefined) update.clientName = data.clientName;
  if (data.costCenter !== undefined) update.costCenter = data.costCenter;
  if (data.projectType !== undefined) update.projectType = data.projectType;
  if (data.isPublic !== undefined) update.isPublic = data.isPublic;
  if (data.billable !== undefined) update.billable = data.billable;

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: update },
    { new: true }
  )
    .populate({ path: 'employees.user', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });

  appAssert(project, INTERNAL_SERVER_ERROR, 'Project update failed');

  // Create history log for project details update
  try {
    const actor = performedBy ? await UserModel.findById(performedBy) : null;
    const actorId = performedBy || project._id;
    const actorName = actor ? `${actor.firstName} ${actor.lastName}` : 'System';
    const actorEmail = actor ? actor.email : 'system@timesync.com';

    await createHistoryLog({
      actionType: HistoryActionType.PROJECT_UPDATED,
      entityType: HistoryEntityType.PROJECT,
      entityId: project._id,
      entityName: project.projectName,
      performedBy: actorId,
      performedByName: actorName,
      performedByEmail: actorEmail,
      description: generateHistoryDescription(
        HistoryActionType.PROJECT_UPDATED,
        project.projectName
      ),
      metadata: {
        updatedFields: Object.keys(update),
      },
    });
  } catch (error) {
  }

  return { project };
};

export const softDeleteProject = async (projectId: string) => {
  // Capture the current project data before deletion
  const existing = await ProjectModel.findById(projectId).select('supervisor employees projectName');

  // Prevent deleting the "Internal" project
  appAssert(
    existing?.projectName !== 'Internal',
    CONFLICT,
    'The Internal project cannot be deleted'
  );

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: { status: false } },
    { new: true }
  )
    .populate({ path: 'employees.user', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
    
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project delete failed');

  // Handle supervisor role management when deleting project
  const supervisorId = existing?.supervisor?._id?.toString() || existing?.supervisor?.toString();
  if (supervisorId) {
    try {
      const prev = await UserModel.findById(supervisorId).select('role');
      
      if (prev && (prev.role === UserRole.SupervisorAdmin || prev.role === UserRole.Supervisor)) {
        // Check if still supervising any other active projects (excluding current deleted project)
        const otherProjects = await ProjectModel.find({
          _id: { $ne: projectId },
          supervisor: supervisorId,
          status: true,
        }).select('_id projectName');
        
        // Check if still supervising any active teams
        const teams = await TeamModel.find({
          supervisor: supervisorId,
          status: true,
        }).select('_id teamName');
        

        // Only demote if not supervising any other projects or teams
        if (otherProjects.length === 0 && teams.length === 0) {
          if (prev.role === UserRole.SupervisorAdmin) {
            await UserModel.findByIdAndUpdate(supervisorId, {
              $set: { role: UserRole.Admin },
            });
          } else if (prev.role === UserRole.Supervisor) {
            await UserModel.findByIdAndUpdate(supervisorId, {
              $set: { role: UserRole.Emp },
            });
          }
        } else {
        }
      }
    } catch (error) {
    }
  }

  // Remove project from all users' teams array
  if (existing?.employees && existing.employees.length > 0) {
    const userIds = existing.employees.map((e: any) => ((e && e.user) ? e.user : e));
    await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $pull: { teams: new mongoose.Types.ObjectId(projectId) } }
    );
  }

  return { project };
};

export const activateProject = async (projectId: string) => {
  const existing = await ProjectModel.findById(projectId).select('projectName status supervisor');

  // Prevent activating the "Internal" project if it somehow got deactivated
  appAssert(
    existing?.projectName !== 'Internal' || existing?.status !== false,
    CONFLICT,
    'The Internal project cannot be manually activated'
  );

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    { $set: { status: true } },
    { new: true }
  )
    .populate({ path: 'employees.user', select: 'firstName lastName email designation' })
    .populate({ path: 'supervisor', select: 'firstName lastName email designation' });
    
  appAssert(project, INTERNAL_SERVER_ERROR, 'Project activation failed');

  // Restore supervisor role if project has a supervisor
  try {
    const supervisorId = existing?.supervisor?.toString();
    if (supervisorId) {
      const supervisor = await UserModel.findById(supervisorId).select('role');
      if (supervisor) {
        // If the user is an Admin, promote to SupervisorAdmin
        if (supervisor.role === UserRole.Admin) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.SupervisorAdmin },
          });
        } 
        // If the user is an Emp, promote to Supervisor
        else if (supervisor.role === UserRole.Emp) {
          await UserModel.findByIdAndUpdate(supervisorId, {
            $set: { role: UserRole.Supervisor },
          });
        }
      }
    }
  } catch (error) {
  }

  return { project };
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
