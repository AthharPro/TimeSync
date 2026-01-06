import API from '../config/apiClient';

export const listProjects = async () => {
  const response = await API.get('/api/project');
  return response.data;
};

export const listMyProjects = async () => {
  const response = await API.get('/api/project/project');
  return response.data;
};

export const listSupervisedProjects = async () => {
  const response = await API.get('/api/project/supervised');
  return response.data;
};

export const createProject = async (params: {
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
  // Ensure description is a non-empty string (required by backend)
  const description = params.description?.trim() || '';
  if (!description) {
    throw new Error('Description is required');
  }

  const payload: any = {
    projectName: params.projectName,
    clientName: params.clientName || 'Default Client',
    billable: params.billable || 'Billable',
    costCenter: params.costCenter || '',
    projectType: params.projectType || '',
    employees: (params.employees || []).map((e: any) =>
      typeof e === 'string' ? { user: e } : e
    ),
    supervisor: params.supervisor ?? null,
    description: description,
  };
  
  // Convert isPublic boolean to string for backend (backend expects string and converts it)
  if (params.isPublic !== undefined) {
    payload.isPublic = params.isPublic ? 'public' : 'private';
  } else {
    // Default to public if not specified
    payload.isPublic = 'public';
  }
  
  if (params.startDate !== undefined && params.startDate !== null) {
    payload.startDate = params.startDate instanceof Date 
      ? params.startDate.toISOString() 
      : params.startDate;
  }
  
  if (params.endDate !== undefined && params.endDate !== null) {
    payload.endDate = params.endDate instanceof Date 
      ? params.endDate.toISOString() 
      : params.endDate;
  }
  
  const response = await API.post('/api/project', payload);
  return response;
};

export const deleteProject = async (projectId: string) => {
  const response = await API.delete(`/api/project/${projectId}`);
  return response.data;
};

export const updateProjectStaff = async (
  projectId: string,
  params: {
    employees?: { user: string; allocation?: number }[];
    supervisor?: string | null;
  }
) => {
  const response = await API.put(`/api/project/${projectId}/staff`, params);
  return response.data;
};





