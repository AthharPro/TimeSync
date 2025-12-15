import api from '../config/apiClient';

export const getUsers = async () => {
  const response = await api.get('/api/user');
  return response.data;
};
