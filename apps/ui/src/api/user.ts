import api from '../config/apiClient';

export const getUsers = async () => {
  const response = await api.get('/api/user');
  return response.data;
};

export const updateUser = async (
  userId: string,
  data: {
    designation?: string;
    contactNumber?: string;
    status?: boolean;
  }
) => {
  const response = await api.put(`/api/user/${userId}`, data);
  return response.data;
};
