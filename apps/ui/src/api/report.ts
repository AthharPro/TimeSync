import API from '../config/apiClient';
import { ReportFilter} from '../interfaces/report/IReportFilter';
import { IEmployee } from '../interfaces/user/IUser';
import { ReportMetadata } from '@tms/shared';
import { buildQueryParams, transformDetailedTimesheetData } from '../utils';

export interface GenerateReportParams {
  filter: ReportFilter;
  format: 'pdf' | 'excel';
}


export const generateDetailedTimesheetReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'excel'
): Promise<Blob> => {
  const params = buildQueryParams(filter);
  params.set('format', format);

  const response = await API.get(`/api/report/detailed-timesheet?${params.toString()}`, {
    responseType: 'blob',
    timeout: 60000 // 60 seconds for report generation
  });

  return response.data;
};

export const generateTimesheetEntriesReport = async (
  filter: ReportFilter,
  format: 'pdf' | 'excel' = 'pdf'
): Promise<Blob> => {
  const params = buildQueryParams(filter);
  params.set('format', format);
  const response = await API.get(`/api/report/timesheet-entries?${params.toString()}`, {
    responseType: 'blob',
    timeout: 60000 // 60 seconds for report generation
  });
  return response.data;
};



export const previewDetailedTimesheet = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  params.set('format', 'json');
  const res = await API.get<{ data: any[] }>(`/api/report/detailed-timesheet?${params.toString()}`);
  console.log('API raw response:', res.data);
  console.log('API response data array:', res.data.data);
  // Return raw data with categories intact - don't transform it
  // The transformation was aggregating everything into single rows, losing project/team separation
  return res.data.data;
};

// Raw preview (untransformed) to preserve per-day descriptions for entry-level views
export const previewDetailedTimesheetRaw = async (filter: ReportFilter) => {
  const params = buildQueryParams(filter);
  params.set('format', 'json');
  const res = await API.get<{ data: any[] }>(`/api/report/timesheet-entries?${params.toString()}`);
  return res.data.data;
};


export const getSupervisedEmployees = async () => {
  return API.get<{ employees: IEmployee[] }>('/api/report/supervised-employees');
};


export const getReportMetadata = async () => {
  return API.get<ReportMetadata>('/api/report/metadata');
};




