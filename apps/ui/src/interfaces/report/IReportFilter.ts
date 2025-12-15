import dayjs, { Dayjs } from 'dayjs';
import { Employee } from '../user/IUser';

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
  value: string | null;
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

export type UserFilterType = 'individual' | 'team' | 'project';

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
  employees?: Employee[];
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
