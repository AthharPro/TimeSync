import api from '../config/apiClient';

export interface HistoryEntry {
  _id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  performedByName: string;
  performedByEmail: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryEntry[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetHistoryParams {
  page?: number;
  limit?: number;
  entityType?: string;
  entityId?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get all history entries with optional filtering and pagination
 */
export const getHistory = async (params?: GetHistoryParams): Promise<HistoryResponse> => {
  const response = await api.get('/api/history', { params });
  return response.data;
};

/**
 * Get recent history entries
 */
export const getRecentHistory = async (limit = 10): Promise<HistoryResponse> => {
  const response = await api.get('/api/history/recent', { params: { limit } });
  return response.data;
};

/**
 * Get history for a specific entity
 */
export const getEntityHistory = async (
  entityType: string,
  entityId: string,
  params?: { page?: number; limit?: number }
): Promise<HistoryResponse> => {
  const response = await api.get(`/api/history/${entityType}/${entityId}`, { params });
  return response.data;
};
