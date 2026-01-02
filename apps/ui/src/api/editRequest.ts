import api from '../config/apiClient';

export interface EditRequestResponse {
  _id: string;
  userId: any;
  month: string;
  year: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  approvedBy?: any;
  approvedDate?: string;
  rejectedBy?: any;
  rejectedDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEditRequestParams {
  month: string;
  year: string;
}

export interface GetEditRequestsParams {
  status?: 'Pending' | 'Approved' | 'Rejected' | 'All';
  month?: string;
  year?: string;
}

/**
 * Create a new edit request for a specific month
 */
export const createEditRequestAPI = async (params: CreateEditRequestParams): Promise<EditRequestResponse> => {
  const response = await api.post('/api/edit-request', params);
  return response.data;
};

/**
 * Get all edit requests created by the current user
 */
export const getMyEditRequestsAPI = async (params?: GetEditRequestsParams): Promise<EditRequestResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.month) queryParams.append('month', params.month);
  if (params?.year) queryParams.append('year', params.year);

  const url = `/api/edit-request/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get all edit requests from supervised employees
 */
export const getSupervisedEditRequestsAPI = async (params?: GetEditRequestsParams): Promise<EditRequestResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.month) queryParams.append('month', params.month);
  if (params?.year) queryParams.append('year', params.year);

  const url = `/api/edit-request/supervised${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Approve an edit request
 */
export const approveEditRequestAPI = async (requestId: string): Promise<EditRequestResponse> => {
  const response = await api.post('/api/edit-request/approve', { requestId });
  return response.data;
};

/**
 * Reject an edit request
 */
export const rejectEditRequestAPI = async (requestId: string, rejectionReason: string): Promise<EditRequestResponse> => {
  const response = await api.post('/api/edit-request/reject', { requestId, rejectionReason });
  return response.data;
};
