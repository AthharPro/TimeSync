export interface ITeam {
  id: string;
  teamName: string;
  members: { id: string; name: string; designation?: string; email?: string }[];
  supervisor: { id: string; name: string; designation?: string; email?: string } | null;
}

export interface CreateTeamFormData {
  teamName: string;
  supervisor: string;
  isDepartment: boolean;
}

export interface CreateTeamPopupProps {
  open: boolean;
  onClose: () => void;
}