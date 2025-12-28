import dayjs, { Dayjs } from 'dayjs';

export interface QuickDateButtonsProps {
  onDateRangeSelect: (start: Dayjs, end: Dayjs) => void;
  disabled?: boolean;
}

export interface ReportFilterLayoutProps {
  title?: string;
  action?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  noBorder?: boolean;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  employeeIds?: string[];
  projectId?: string;
  teamId?: string;
  workType?: 'project' | 'team' | 'both';
}

export interface FilterColumnProps {
  children: React.ReactNode;
  flex?: number;
}

export interface FilterRowProps {
  children: React.ReactNode;
  gap?: number;
}

export interface DatePickerAtomProps {
  label: string;
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  disabled?: boolean;
  minDate?: Dayjs;
}

export interface DateRangePickerProps {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  disabled?: boolean;
}



export interface UserFilterTypeSelectorProps {
  filterType?: UserFilterType;
  onChange?: (type: UserFilterType) => void;
  disabled?: boolean;
  availableOptions?: UserFilterType[];
}

export interface ReportEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}


export interface EmployeeSelectProps {
  employees: ReportEmployee[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export interface ProjectTeamItem {
  _id: string;
  name: string;
  userCount: number;
  supervisor?: string; 
}

export interface ProjectTeamSelectProps {
  items: ProjectTeamItem[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  label: string;
  placeholder: string;
}


export interface UserSelectionFieldProps {
  filterType: UserFilterType;
  // Individual selection props
  employees?: ReportEmployee[];
  selectedEmployeeIds?: string[];
  onEmployeeChange?: (ids: string[]) => void;
  // Team selection props
  teams?: ProjectTeamItem[];
  selectedTeamId?: string;
  onTeamChange?: (id: string) => void;
  isLoadingTeams?: boolean;
  // Project selection props
  projects?: ProjectTeamItem[];
  selectedProjectId?: string;
  onProjectChange?: (id: string) => void;
  isLoadingProjects?: boolean;
  // Common props
  disabled?: boolean;
  showHelperText?: boolean;
}

export interface IReportFilterProps {
  resetTrigger?: number;
  currentFilter?: ReportFilter;
  onFilterChange?: (filter: ReportFilter) => void;
}

export type UserFilterType = 'individual' | 'team' | 'project';

export interface UserFilterConfig {
  type: UserFilterType;
  individualIds?: string[];
  teamIds?: string[];
  projectIds?: string[];
}



export interface UseUserFilterTypeOptions {
  userRole: string;
  canSeeAllData: boolean;
}

export interface TeamListItem {
  _id: string;
  teamName: string;
  createdAt: string;
  members: Array<{ _id: string; firstName: string; lastName: string; email?: string; designation?: string }>;
  supervisor: { _id: string; firstName: string; lastName: string; email?: string; designation?: string } | null;
  isDepartment?: boolean;
}

export interface ProjectListItem {
  _id: string;
  projectName: string;
  billable: boolean;
  employees: { _id: string; firstName: string; lastName: string; email: string; designation?: string }[];
  supervisor?: { _id: string; firstName: string; lastName: string; email: string; designation?: string } | null;
  createdAt?: string;
  status?: boolean;
}

export interface UseUserFilterTypeReturn {
  userFilterType: UserFilterType;
  setUserFilterType: React.Dispatch<React.SetStateAction<UserFilterType>>;
  availableFilterOptions: UserFilterType[];
  teams: TeamListItem[];
  selectedTeamId: string;
  setSelectedTeamId: React.Dispatch<React.SetStateAction<string>>;
  isLoadingTeams: boolean;
  projects: ProjectListItem[];
  selectedProjectId: string;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string>>;
  isLoadingProjects: boolean;
  users: ReportEmployee[];
  isLoadingUsers: boolean;
  resetFilterType: () => void;
}