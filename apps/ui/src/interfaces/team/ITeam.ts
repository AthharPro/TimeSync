export interface ITeam {
  id: string;
  teamName: string;
  members: { id: string; name: string; designation?: string; email?: string }[];
  supervisor: { id: string; name: string; designation?: string; email?: string } | null;
  status?: boolean;
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

export interface ISupervisorMemberCardProps {
  supervisor: {
    name: string;
    designation?: string;
    email?: string;
  } | null;
  allocation?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  designation?: string;
}

export interface TeamMemberCardProps {
  member: TeamMember;
  allocation?: number;
}

export interface ViewTeamMembersProps {
  open: boolean;
  onClose: () => void;
  team: {
    teamName: string;
    supervisor: TeamMember | null;
    members: TeamMember[];
  } | null;
}

