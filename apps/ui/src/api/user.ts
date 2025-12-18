import api from '../config/apiClient';
import { UserRole } from '@tms/shared';

export const getUsers = async (roles?: UserRole[]) => {
  const query = roles && roles.length ? `?roles=${roles.join(',')}` : '';
  const response = await api.get(`/api/user${query}`);
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
