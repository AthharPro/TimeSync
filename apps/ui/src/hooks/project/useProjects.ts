import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { IProject } from '../../interfaces/project/IProject';
import {
  fetchProjects,
  createProjectAction,
  deleteProjectAction,
  activateProjectAction,
  updateProjectStaffAction,
  updateProjectDetailsAction,
} from '../../store/slices/projectSlice';

export interface UseProjectsReturn {
  projects: IProject[];
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (params: {
    projectName: string;
    description: string;
    clientName?: string;
    billable?: string;
    costCenter?: string;
    projectType?: string;
    employees?: (string | { user: string; allocation?: number })[];
    supervisor?: string | null;
    isPublic?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
  }) => Promise<IProject>;
  deleteProject: (projectId: string) => Promise<void>;
  activateProject: (projectId: string) => Promise<void>;
  updateProjectStaff: (
    projectId: string,
    params: {
      employees?: { user: string; allocation?: number }[];
      supervisor?: string | null;
    }
  ) => Promise<IProject>;
  updateProjectDetails: (
    projectId: string,
    params: {
      projectName?: string;
      description?: string;
      projectVisibility?: string;
      billable?: boolean;
      clientName?: string;
      projectType?: string;
      costCenter?: string;
      startDate?: Date | null;
      endDate?: Date | null;
    }
  ) => Promise<IProject>;
}

export const useProjects = (): UseProjectsReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux store and convert ISO string dates back to Date objects
  const projectsRaw = useSelector((state: RootState) => state.project.projects);
  const loading = useSelector((state: RootState) => state.project.loading);
  const error = useSelector((state: RootState) => state.project.error);

  // Convert dates to Date objects for the interface (handles both Date objects and ISO strings)
  const projects: IProject[] = projectsRaw.map((project: any) => ({
    ...project,
    startDate: project.startDate instanceof Date ? project.startDate : (typeof project.startDate === 'string' ? new Date(project.startDate) : new Date()),
    endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate : (typeof project.endDate === 'string' ? new Date(project.endDate) : null)) : null,
    createdAt: project.createdAt instanceof Date ? project.createdAt : (typeof project.createdAt === 'string' ? new Date(project.createdAt) : new Date()),
    updatedAt: project.updatedAt instanceof Date ? project.updatedAt : (typeof project.updatedAt === 'string' ? new Date(project.updatedAt) : new Date()),
  }));

  // Load projects from backend
  const loadProjects = useCallback(async () => {
    try {
      const result = await dispatch(fetchProjects());
      if (fetchProjects.rejected.match(result)) {
        console.error('Failed to load projects:', result.payload);
        throw new Error(result.payload as string);
      }
    } catch (error) {
      console.error('Load projects error:', error);
      throw error;
    }
  }, [dispatch]);

  // Create a new project
  const createProject = useCallback(
    async (params: {
      projectName: string;
      description: string;
      clientName?: string;
      billable?: string;
      costCenter?: string;
      projectType?: string;
      employees?: (string | { user: string; allocation?: number })[];
      supervisor?: string | null;
      isPublic?: boolean;
      startDate?: Date | null;
      endDate?: Date | null;
    }) => {
      try {
        const result = await dispatch(createProjectAction(params));
        if (createProjectAction.rejected.match(result)) {
          console.error('Failed to create project:', result.payload);
          throw new Error(result.payload as string);
        }
        const project: any = result.payload;
        return {
          ...project,
          startDate: project.startDate instanceof Date ? project.startDate : (typeof project.startDate === 'string' ? new Date(project.startDate) : new Date()),
          endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate : (typeof project.endDate === 'string' ? new Date(project.endDate) : null)) : null,
          createdAt: project.createdAt instanceof Date ? project.createdAt : (typeof project.createdAt === 'string' ? new Date(project.createdAt) : new Date()),
          updatedAt: project.updatedAt instanceof Date ? project.updatedAt : (typeof project.updatedAt === 'string' ? new Date(project.updatedAt) : new Date()),
        } as IProject;
      } catch (error) {
        console.error('Create project error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        const result = await dispatch(deleteProjectAction(projectId));
        if (deleteProjectAction.rejected.match(result)) {
          console.error('Failed to delete project:', result.payload);
          throw new Error(result.payload as string);
        }
      } catch (error) {
        console.error('Delete project error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Activate a project
  const activateProject = useCallback(
    async (projectId: string) => {
      try {
        const result = await dispatch(activateProjectAction(projectId));
        if (activateProjectAction.rejected.match(result)) {
          console.error('Failed to activate project:', result.payload);
          throw new Error(result.payload as string);
        }
      } catch (error) {
        console.error('Activate project error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Update project staff (employees and supervisor)
  const updateProjectStaff = useCallback(
    async (
      projectId: string,
      params: {
        employees?: { user: string; allocation?: number }[];
        supervisor?: string | null;
      }
    ) => {
      try {
        const result = await dispatch(
          updateProjectStaffAction({ projectId, ...params })
        );
        if (updateProjectStaffAction.rejected.match(result)) {
          console.error('Failed to update project staff:', result.payload);
          throw new Error(result.payload as string);
        }
        const project: any = result.payload;
        return {
          ...project,
          startDate: project.startDate instanceof Date ? project.startDate : (typeof project.startDate === 'string' ? new Date(project.startDate) : new Date()),
          endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate : (typeof project.endDate === 'string' ? new Date(project.endDate) : null)) : null,
          createdAt: project.createdAt instanceof Date ? project.createdAt : (typeof project.createdAt === 'string' ? new Date(project.createdAt) : new Date()),
          updatedAt: project.updatedAt instanceof Date ? project.updatedAt : (typeof project.updatedAt === 'string' ? new Date(project.updatedAt) : new Date()),
        } as IProject;
      } catch (error) {
        console.error('Update project staff error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Update project details
  const updateProjectDetails = useCallback(
    async (
      projectId: string,
      params: {
        projectName?: string;
        description?: string;
        projectVisibility?: string;
        billable?: boolean;
        clientName?: string;
        projectType?: string;
        costCenter?: string;
        startDate?: Date | null;
        endDate?: Date | null;
      }
    ) => {
      try {
        const result = await dispatch(
          updateProjectDetailsAction({ projectId, ...params })
        );
        if (updateProjectDetailsAction.rejected.match(result)) {
          console.error('Failed to update project details:', result.payload);
          throw new Error(result.payload as string);
        }
        const project: any = result.payload;
        return {
          ...project,
          startDate: project.startDate instanceof Date ? project.startDate : (typeof project.startDate === 'string' ? new Date(project.startDate) : new Date()),
          endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate : (typeof project.endDate === 'string' ? new Date(project.endDate) : null)) : null,
          createdAt: project.createdAt instanceof Date ? project.createdAt : (typeof project.createdAt === 'string' ? new Date(project.createdAt) : new Date()),
          updatedAt: project.updatedAt instanceof Date ? project.updatedAt : (typeof project.updatedAt === 'string' ? new Date(project.updatedAt) : new Date()),
        } as IProject;
      } catch (error) {
        console.error('Update project details error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    deleteProject,
    activateProject,
    updateProjectStaff,
    updateProjectDetails,
  };
};
