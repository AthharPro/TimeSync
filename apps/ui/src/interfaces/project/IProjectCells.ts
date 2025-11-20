import { IProject, IProjectManager, ITeamMember } from './IProject';

export interface IProjectManagerCellProps {
  manager: IProjectManager;
}

export interface ITeamMembersCellProps {
  teamMembers: ITeamMember[];
  onViewTeam?: () => void;
}

export interface IDateRangeCellProps {
  startDate: Date;
  endDate: Date | null;
}

export interface IProjectActionButtonsProps {
  project: IProject;
  onEdit?: (project: IProject) => void;
  onDelete?: (projectId: string) => void;
}
