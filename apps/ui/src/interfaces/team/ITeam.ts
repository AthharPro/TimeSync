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
  onTeamCreated?: () => void;
}

export interface ITeamStaffManagerProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  initialMembers: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSaved?: () => void;
}