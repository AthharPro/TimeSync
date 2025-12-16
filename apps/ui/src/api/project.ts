import API from '../config/apiClient';

export const listMyProjects = async () => {
  return API.get('/api/project/my-projects');
};

export const createProject = async (params: {
  projectName: string;
  clientName?: string;
  billable?: string;
}) => {
  const payload = {
    projectName: params.projectName,
    clientName: params.clientName || 'Default Client',
    billable: params.billable || 'Billable',
    employees: [],
  };
  return API.post('/api/project', payload);
};





