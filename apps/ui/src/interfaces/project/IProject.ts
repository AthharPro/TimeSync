import { Control, FieldErrors } from 'react-hook-form';
import { IEmployee } from '../user/IUser';
export type CostCenter = 'Canada' | 'Australia' | 'Sweden' | 'Sri Lanka';
export type ProjectType = 'Fixed Bid' | 'T&M' | 'Retainer';

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  allocation: number; // Percentage allocation (0-100)
}

export interface IProjectManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  allocation: number; // Percentage allocation (0-100)
}

export interface MyProject {
  _id: string;
  projectName: string;
  isPublic?: boolean;
}

export interface MyProjectsState {
  projects: MyProject[];
}

export interface IProject {
  id: string;
  projectName: string;
  costCenter: CostCenter | '';
  clientName: string;
  projectVisibility: string;
  description: string;
  projectType: ProjectType | '';
  projectManager?: IProjectManager;
  supervisor?: string | null;
  teamMembers: ITeamMember[];
  startDate: Date | string;
  endDate: Date | string | null;
  billable: boolean;
  status: 'Active' | 'Completed' | 'On Hold';
  isActive?: boolean; // Backend status boolean
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectFormData {
  projectName: string;
  description: string;
  projectVisibility: string;
  billable?: 'yes' | 'no';
  supervisor?: string | null;
  costCenter?: CostCenter;
  projectType?: ProjectType;
  clientName?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface CreateProjectPopupProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

export interface IBillableSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

export interface IProjectTypeSelectProps {
  value: ProjectType | '';
  onChange: (value: ProjectType) => void;
  error?: boolean;
  helperText?: string;
}

export interface ICostCenterSelectProps {
  value: CostCenter | '';
  onChange: (value: CostCenter) => void;
  error?: boolean;
  helperText?: string;
}

export interface ProjectStaffManagerProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  initialEmployees: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSaved?: () => void;
}

export interface IProjectVisibilityProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

export interface CreateProjectFormProps {
  control: Control<CreateProjectFormData>;
  errors: FieldErrors<CreateProjectFormData>;
  isValid: boolean;
  isSubmitting: boolean;
  selectedEmployees: IEmployee[];
  onAddEmployeesClick: () => void;
  onRemoveEmployee: (employeeId: string) => void;
  onCancel: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  projectVisibility: string;
}


export interface EditProjectPopupProps {
  open: boolean;
  onClose: () => void;
  project: IProject;
  onSaved?: () => void;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}