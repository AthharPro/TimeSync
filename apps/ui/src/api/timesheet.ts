import api from '../config/apiClient';

interface GetTimesheetsParams {
  startDate?: Date;
  endDate?: Date;
}

export const getTimesheets = async (params?: GetTimesheetsParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.startDate) {
    queryParams.append('startDate', params.startDate.toISOString());
  }
  
  if (params?.endDate) {
    queryParams.append('endDate', params.endDate.toISOString());
  }

  const url = `/api/timesheet${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

export const submitTimesheetsAPI = async (timesheetIds: string[]) => {
  const response = await api.post('/api/timesheet/submit', { timesheetIds });
  return response.data;
};
