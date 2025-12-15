import { CONFLICT, INTERNAL_SERVER_ERROR } from '../constants/http';
import ProjectModel from '../models/project.model';
import { UserRole } from '@tms/shared';
import { CreateProjectParams } from '../interfaces/project';
import { appAssert } from '../utils';
import mongoose from 'mongoose';

export const createProject = async (data: CreateProjectParams, performedBy?: string) => {
  const existingProject = await ProjectModel.exists({
    projectName: data.projectName,
  });

  appAssert(!existingProject, CONFLICT, 'Project already exists');

  const project = await ProjectModel.create({
    projectName: data.projectName,
    clientName: data.clientName,
    billable: data.billable,
    employees:  data.employees?.map(emp => new mongoose.Types.ObjectId(emp)),
    supervisor: new mongoose.Types.ObjectId(data.supervisor),
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
