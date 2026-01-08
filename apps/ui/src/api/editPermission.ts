import api from '../config/apiClient';

/**
 * Check if user has edit permission for a specific month
 */
export const checkEditPermissionAPI = async (month: string, year: string): Promise<boolean> => {
  try {
    const response = await api.get(`/api/edit-request/check-permission`, {
      params: { month, year }
    });
    return response.data.hasPermission || false;
  } catch (error) {
    return false;
  }
};
