import api from '../config/apiClient';

interface GetTimesheetsParams {
  startDate?: Date;
  endDate?: Date;
}

interface CreateTimesheetParams {
  date: Date | string;
  projectId?: string;
  taskId?: string;
  billable?: string;
  description?: string;
  hours?: number;
}

interface UpdateTimesheetParams {
  date?: Date | string;
  projectId?: string;
  taskId?: string;
  billable?: string;
  description?: string;
  hours?: number;
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

export const createTimesheet = async (params: CreateTimesheetParams) => {
  const payload: any = {
    date: params.date instanceof Date ? params.date.toISOString() : params.date,
  };
  
  if (params.projectId) payload.projectId = params.projectId;
  if (params.taskId) payload.taskId = params.taskId;
  if (params.billable) payload.billable = params.billable;
  if (params.description !== undefined) payload.description = params.description;
  if (params.hours !== undefined) payload.hours = params.hours;
  
  const response = await api.post('/api/timesheet', payload);
  return response.data;
};

export const updateTimesheet = async (timesheetId: string, params: UpdateTimesheetParams) => {
  const payload: any = {};
  
  if (params.date !== undefined) {
    payload.date = params.date instanceof Date ? params.date.toISOString() : params.date;
  }
  if (params.projectId !== undefined) payload.projectId = params.projectId || null;
  if (params.taskId !== undefined) payload.taskId = params.taskId || null;
  if (params.billable !== undefined) payload.billable = params.billable;
  if (params.description !== undefined) payload.description = params.description;
  if (params.hours !== undefined) payload.hours = params.hours;
  
  const response = await api.put(`/api/timesheet/${timesheetId}`, payload);
  return response.data;
};

export const submitTimesheetsAPI = async (timesheetIds: string[]) => {
  const response = await api.post('/api/timesheet/submit', { timesheetIds });
  return response.data;
};

export const deleteTimesheetsAPI = async (timesheetIds: string[]) => {
  const response = await api.delete('/api/timesheet', { data: { timesheetIds } });
  return response.data;
};
