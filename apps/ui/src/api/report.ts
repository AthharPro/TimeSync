import api from '../config/apiClient';

export interface GetReportMetadataResponse {
  metadata: any;
}

export interface GetSupervisedEmployeesResponse {
  employees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export interface GenerateReportParams {
  format?: 'pdf' | 'excel' | 'json';
  startDate?: string;
  endDate?: string;
  employeeIds?: string[];
  projectIds?: string[];
  teamIds?: string[];
  workType?: 'project' | 'team' | 'both';
  approvalStatus?: string[];
}

export const getReportMetadata = async (): Promise<GetReportMetadataResponse> => {
  const response = await api.get('/api/report/metadata');
  return response.data;
};

export const getSupervisedEmployees = async (): Promise<GetSupervisedEmployeesResponse> => {
  const response = await api.get('/api/report/supervised-employees');
  return response.data;
};

export const generateDetailedTimesheetReport = async (
  params: GenerateReportParams
): Promise<Blob | any> => {
  const queryParams = new URLSearchParams();
  
  if (params.format) {
    queryParams.append('format', params.format);
  }
  if (params.startDate) {
    queryParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    queryParams.append('endDate', params.endDate);
  }
  if (params.employeeIds && params.employeeIds.length > 0) {
    params.employeeIds.forEach(id => queryParams.append('employeeIds', id));
  }
  if (params.projectIds && params.projectIds.length > 0) {
    params.projectIds.forEach(id => queryParams.append('projectIds', id));
  }
  if (params.teamIds && params.teamIds.length > 0) {
    params.teamIds.forEach(id => queryParams.append('teamIds', id));
  }
  if (params.workType) {
    queryParams.append('workType', params.workType);
  }
  if (params.approvalStatus && params.approvalStatus.length > 0) {
    params.approvalStatus.forEach(status => queryParams.append('approvalStatus', status));
  }

  const url = `/api/report/detailed-timesheet${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  if (params.format === 'json') {
    const response = await api.get(url);
    return response.data;
  } else {
    // For PDF/Excel, we need to handle blob response
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  }
};

export const generateTimesheetEntriesReport = async (
  params: GenerateReportParams
): Promise<Blob | any> => {
  const queryParams = new URLSearchParams();
  
  if (params.format) {
    queryParams.append('format', params.format);
  }
  if (params.startDate) {
    queryParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    queryParams.append('endDate', params.endDate);
  }
  if (params.employeeIds && params.employeeIds.length > 0) {
    params.employeeIds.forEach(id => queryParams.append('employeeIds', id));
  }
  if (params.projectIds && params.projectIds.length > 0) {
    params.projectIds.forEach(id => queryParams.append('projectIds', id));
  }
  if (params.teamIds && params.teamIds.length > 0) {
    params.teamIds.forEach(id => queryParams.append('teamIds', id));
  }
  if (params.workType) {
    queryParams.append('workType', params.workType);
  }
  if (params.approvalStatus && params.approvalStatus.length > 0) {
    params.approvalStatus.forEach(status => queryParams.append('approvalStatus', status));
  }

  const url = `/api/report/timesheet-entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  if (params.format === 'json') {
    const response = await api.get(url);
    return response.data;
  } else {
    // For PDF/Excel, we need to handle blob response
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  }
};

