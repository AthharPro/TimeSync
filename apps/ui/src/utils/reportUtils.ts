import { ReportFilter } from '../interfaces/report/IReportFilter';
import { DetailedTimesheetPreviewRow } from '../interfaces/report/IReportPreview';


export const buildQueryParams = (filter: ReportFilter): URLSearchParams => {
  const params = new URLSearchParams();
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) filter.employeeIds.forEach((id) => params.append('employeeIds', id));
  if (filter.projectId) params.append('projectIds', filter.projectId);
  if (filter.teamId) params.append('teamIds', filter.teamId);
  if (filter.workType && !filter.projectId && !filter.teamId) params.append('workType', filter.workType);
  return params;
};


export const transformDetailedTimesheetData = (data: any[]): DetailedTimesheetPreviewRow[] => {
  // Group data by employee and week to ensure one row per week
  // Daily hours array structure: [Mon(0), Tue(1), Wed(2), Thu(3), Fri(4), Sat(5), Sun(6)]
  const weeklyMap = new Map<string, {
    employeeName: string;
    employeeEmail: string;
    weekStartDate: string;
    weekEndDate: string;
    status: string;
    dailyHours: number[];
    dailyStatuses: string[];
  }>();
  
  (data || []).forEach((t: any) => {
    const weekStartDate = typeof t.weekStartDate === 'string' ? t.weekStartDate : new Date(t.weekStartDate).toISOString().slice(0, 10);
    
    // Create unique key for employee + week
    const weekKey = `${t.employeeName}|${t.employeeEmail}|${weekStartDate}`;
    
    // Get or create weekly entry
    if (!weeklyMap.has(weekKey)) {
      // Calculate week end date (Friday - 4 days after Monday start)
      let weekEndDate = '';
      try {
        const startDate = new Date(weekStartDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 4); // Friday (Mon + 4 days)
        weekEndDate = endDate.toISOString().slice(0, 10);
      } catch {
        weekEndDate = '';
      }
      
      weeklyMap.set(weekKey, {
        employeeName: t.employeeName,
        employeeEmail: t.employeeEmail,
        weekStartDate: weekStartDate,
        weekEndDate: weekEndDate,
        status: 'Draft',
        dailyHours: Array(7).fill(0),
        dailyStatuses: Array(7).fill('Draft')
      });
    }
    
    const weekEntry = weeklyMap.get(weekKey)!;
    
    const weekdayIndices = [0, 1, 2, 3, 4];
    const dayStatusPrecedence: Record<string, number> = {
      'Rejected': 4,
      'Pending': 3,
      'Approved': 2,
      'Draft': 1,
    };

    // Aggregate hours across all categories/items for this week
    (t.categories || []).forEach((c: any) => {
      (c.items || []).forEach((it: any) => {
        const hoursArr: number[] = Array.isArray(it.dailyHours) 
          ? it.dailyHours.map((h: any) => Number(h) || 0) 
          : [];
        const dailyStatusArr: string[] = Array.isArray(it.dailyStatus) ? it.dailyStatus : [];
        
        // Sum up hours for each day
        for (let d = 0; d < 7; d++) {
          weekEntry.dailyHours[d] += hoursArr[d] || 0;
          
          const hasHours = (hoursArr[d] || 0) > 0;
          if (hasHours) {
            const statusForItem = dailyStatusArr[d] || 'Draft';
            const currentAgg = weekEntry.dailyStatuses[d];
            if ((dayStatusPrecedence[statusForItem] || 0) > (dayStatusPrecedence[currentAgg] || 0)) {
              weekEntry.dailyStatuses[d] = statusForItem;
            }
          }
        }
      });
    });
  });

  // Convert the map to rows array
  const rows: DetailedTimesheetPreviewRow[] = [];
  
  weeklyMap.forEach((weekEntry) => {
    const weekdayIndices = [0, 1, 2, 3, 4];
    
    // Determine week-level status based on Mon-Fri
    const isWeekFullyApproved = weekdayIndices.every((idx) => weekEntry.dailyStatuses[idx] === 'Approved');
    const isWeekFullyRejected = weekdayIndices.every((idx) => weekEntry.dailyStatuses[idx] === 'Rejected');
    
    const weekLevelStatus = isWeekFullyApproved
      ? 'Approved'
      : isWeekFullyRejected
        ? 'Rejected'
        : 'Pending';

    // Calculate total hours from Mon-Fri only (indices 0-4)
    const totalHours = weekEntry.dailyHours.slice(0, 5).reduce((sum: number, hours: number) => {
      return sum + hours;
    }, 0);
    
    // Create ONE row per employee per week with aggregated daily hours
    // Show empty string for 0 hours, actual value for hours worked
    rows.push({
      employeeName: weekEntry.employeeName,
      employeeEmail: weekEntry.employeeEmail,
      weekStartDate: weekEntry.weekStartDate,
      weekEndDate: weekEntry.weekEndDate,
      status: weekLevelStatus,
      category: 'All Work',
      work: 'Total Hours',
      projectName: '',
      mon: weekEntry.dailyHours[0] ? String(weekEntry.dailyHours[0]) : '',
      tue: weekEntry.dailyHours[1] ? String(weekEntry.dailyHours[1]) : '',
      wed: weekEntry.dailyHours[2] ? String(weekEntry.dailyHours[2]) : '',
      thu: weekEntry.dailyHours[3] ? String(weekEntry.dailyHours[3]) : '',
      fri: weekEntry.dailyHours[4] ? String(weekEntry.dailyHours[4]) : '',
      sat: weekEntry.dailyHours[5] ? String(weekEntry.dailyHours[5]) : '',
      sun: weekEntry.dailyHours[6] ? String(weekEntry.dailyHours[6]) : '',
      total: String(totalHours.toFixed(2)),
    });
  });
  
  // Sort by employee name and then by week start date
  rows.sort((a, b) => {
    const nameCompare = a.employeeName.localeCompare(b.employeeName);
    if (nameCompare !== 0) return nameCompare;
    return new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime();
  });
  
  return rows;
};


export const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateReportFilename = (
  reportType:  'detailed-timesheet' | 'timesheet-entries',
  format: 'pdf' | 'excel'
): string => {
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'pdf' ? 'pdf' : 'xlsx';
  return `${reportType}-report-${date}.${extension}`;
};