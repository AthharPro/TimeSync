import { DailyTimesheetStatus } from '@tms/shared';


export interface ITimesheetReportDataItem {
  work: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  dailyHours: Array<string | number>;
  dailyDescriptions: Array<string>;
  dailyStatus: DailyTimesheetStatus[];
  totalHours: number;
}

export interface ITimesheetReportCategory {
  category: string;
  items: ITimesheetReportDataItem[];
}

export interface ITimesheetReportData {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  weekStartDate: Date | string;
  timesheetId: string;
  status: DailyTimesheetStatus;
  submissionDate?: Date | string | null;
  approvalDate?: Date | string | null;
  rejectionReason?: string;
  totalHours: number;
  categories: ITimesheetReportCategory[];
}

export interface IReportFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  employeeIds?: string[];
  projectIds?: string[];
  teamIds?: string[];
  approvalStatus?: DailyTimesheetStatus[];
  submissionStatus?: DailyTimesheetStatus[];
}

export enum ReportType {
  DETAILED_TIMESHEET = 'detailed-timesheet'
}

export enum ReportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}



export interface IDetailedTimesheetReport {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  weekStartDate: string;
  status: string;
  categories: Array<{
    category: string;
    items: Array<{
      work: string;
      projectName?: string;
      teamName?: string;
      dailyHours: number[];
      totalHours: number;
    }>;
  }>;
  totalHours: number;
}

export interface ProfessionalPDFConfig {

  company: {
    name: string;
    address?: string;
    logo?: string;
    website?: string;
    phone?: string;
  };

  
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    warning: string;
    background: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };


  fonts: {
    primary: string;
    bold: string;
    sizes: {
      title: number;
      subtitle: number;
      header: number;
      body: number;
      small: number;
    };
  };

 
  layout: {
    pageMargin: number;
    headerHeight: number;
    footerHeight: number;
    sectionSpacing: number;
  };

  features: {
    watermark: boolean;
    pageNumbers: boolean;
    tableOfContents: boolean;
    executiveSummary: boolean;
    recommendations: boolean;
    charts: boolean;
  };

 
  reports: {
    submissionStatus: {
      includeAnalytics: boolean;
      showTrends: boolean;
      highlightIssues: boolean;
    };
    approvalStatus: {
      includeWorkflow: boolean;
      showProcessingTime: boolean;
      includeRecommendations: boolean;
    };
    detailedTimesheet: {
      includeProjectBreakdown: boolean;
      showProductivityMetrics: boolean;
      includeUtilizationAnalysis: boolean;
    };
  };
}