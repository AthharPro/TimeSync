import { useState, useCallback } from 'react';
import {
  createEditRequestAPI,
  getMyEditRequestsAPI,
  getSupervisedEditRequestsAPI,
  approveEditRequestAPI,
  rejectEditRequestAPI,
  EditRequestResponse,
  GetEditRequestsParams
} from '../../api/editRequest';

export const useEditRequest = () => {
  const [myRequests, setMyRequests] = useState<EditRequestResponse[]>([]);
  const [supervisedRequests, setSupervisedRequests] = useState<EditRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(async (month: string, year: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createEditRequestAPI({ month, year });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create edit request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMyRequests = useCallback(async (params?: GetEditRequestsParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const requests = await getMyEditRequestsAPI(params);
      setMyRequests(requests);
      return requests;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load your edit requests');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSupervisedRequests = useCallback(async (params?: GetEditRequestsParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const requests = await getSupervisedEditRequestsAPI(params);
      setSupervisedRequests(requests);
      return requests;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load supervised edit requests');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approve = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await approveEditRequestAPI(requestId);
      // Refresh supervised requests
      await loadSupervisedRequests();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve edit request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadSupervisedRequests]);

  const reject = useCallback(async (requestId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await rejectEditRequestAPI(requestId, reason);
      // Refresh supervised requests
      await loadSupervisedRequests();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject edit request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadSupervisedRequests]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    myRequests,
    supervisedRequests,
    isLoading,
    error,
    createRequest,
    loadMyRequests,
    loadSupervisedRequests,
    approve,
    reject,
    clearError
  };
};
