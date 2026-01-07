import { IProject, IProjectManager, ITeamMember } from './IProject';

export interface IProjectManagerCellProps {
  manager?: IProjectManager | null;
}

export interface ITeamMembersCellProps {
  teamMembers: ITeamMember[];
  onViewTeam?: () => void;
  disabled?: boolean;
}

export interface IDateRangeCellProps {
  startDate: Date | string;
  endDate: Date | string | null;
}

export interface IProjectActionButtonsProps {
  project: IProject;
  onEdit?: (project: IProject) => void;
  onDelete?: (projectId: string) => void;
}
