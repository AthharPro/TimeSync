import { IProject } from './IProject';

export interface ITeamMemberCardProps {
  name: string;
  role: string;
  email: string;
  avatar?: string;
  isManager?: boolean;
  allocation?: number; // Percentage allocation (0-100)
}

export interface ITeamViewModalProps {
  open: boolean;
  onClose: () => void;
  project: IProject;
}
