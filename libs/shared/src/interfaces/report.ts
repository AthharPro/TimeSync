export interface ReportMetadata {
  reportTypes: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  formats: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  statusOptions: Array<{
    key: string;
    name: string;
  }>;
}

export const REPORT_METADATA: ReportMetadata = {
  reportTypes: [
    { key: 'submission-status', name: 'Submission Status', description: 'Timesheet submission compliance' },
    { key: 'approval-status', name: 'Approval Status', description: 'Timesheet approval workflow' },
    { key: 'detailed-timesheet', name: 'Detailed Timesheet', description: 'Comprehensive timesheet data' },
    { key: 'timesheet-entries', name: 'Timesheet Entries', description: 'Daily entry view with descriptions' },
  ],
  formats: [
    { key: 'excel', name: 'Excel (.xlsx)', description: 'Spreadsheet format' },
    { key: 'pdf', name: 'PDF (.pdf)', description: 'Portable Document Format' },
  ],
  statusOptions: [
    { key: 'Submitted', name: 'Submitted' },
    { key: 'Missed', name: 'Missed' },
    { key: 'Late', name: 'Late' },
    { key: 'Pending', name: 'Pending' },
    { key: 'Approved', name: 'Approved' },
    { key: 'Rejected', name: 'Rejected' },
  ],
};
