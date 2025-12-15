import api from '../config/apiClient';

export interface Task {
  _id: string;
  projectId: string;
  taskName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskParams {
  projectId: string;
  taskName: string;
}

export const taskAPI = {
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get(`/api/task/project/${projectId}`);
    return response.data;
  },

  createTask: async (params: CreateTaskParams): Promise<Task> => {
    const response = await api.post('/api/task', params);
    return response.data;
  },
};
