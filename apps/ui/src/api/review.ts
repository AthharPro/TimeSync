import api from '../config/apiClient';

export interface ReviewEmployee {
  _id: string;
  employee_id?: string;
  firstName: string;
  lastName: string;
  email: string;
  designation?: string;
}

export interface GetSupervisedEmployeesForReviewResponse {
  employees: ReviewEmployee[];
}

export interface EmployeeTimesheet {
  _id: string;
  userId: string;
  date: string;
  projectId?: {
    _id: string;
    projectName: string;
  } | null;
  taskId?: {
    _id: string;
    taskName: string;
  } | null;
  billable?: string;
  description?: string;
  hours?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetEmployeeTimesheetsResponse {
  employee: {
    _id: string;
    name: string;
  };
  timesheets: EmployeeTimesheet[];
}

/**
 * Get employees that the current supervisor can review timesheets for
 * This includes employees from projects and teams where the supervisor is assigned
 */
export const getSupervisedEmployeesForReview = async (): Promise<GetSupervisedEmployeesForReviewResponse> => {
  const response = await api.get('/api/review/employees');
  return response.data;
};

/**
 * Get timesheets for a specific employee
 * Only returns timesheets if the supervisor has permission to view them
 */
export const getEmployeeTimesheetsForReview = async (
  employeeId: string,
  params?: { startDate?: Date; endDate?: Date }
): Promise<GetEmployeeTimesheetsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.startDate) {
    queryParams.append('startDate', params.startDate.toISOString());
  }
  
  if (params?.endDate) {
    queryParams.append('endDate', params.endDate.toISOString());
  }

  const url = `/api/review/employees/${employeeId}/timesheets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Approve timesheets
 * Only timesheets in Pending status can be approved
 */
export const approveTimesheets = async (timesheetIds: string[]): Promise<{ message: string; approved: number }> => {
  const response = await api.post('/api/review/timesheets/approve', { timesheetIds });
  return response.data;
};

/**
 * Reject timesheets with a reason
 * Only timesheets in Pending status can be rejected
 */
export const rejectTimesheets = async (
  timesheetIds: string[],
  rejectionReason: string
): Promise<{ message: string; rejected: number }> => {
  const response = await api.post('/api/review/timesheets/reject', { timesheetIds, rejectionReason });
  return response.data;
};
