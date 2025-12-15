export interface ITeam {
  id: string;
  teamName: string;
  members: { id: string; name: string; designation?: string; email?: string }[];
  supervisor: { id: string; name: string; designation?: string; email?: string } | null;
}