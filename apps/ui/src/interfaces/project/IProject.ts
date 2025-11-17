export type CostCenter = 'Canada' | 'Australia' | 'Sweden' | 'Sri Lanka';
export type ProjectType = 'Fixed Bid' | 'T&M' | 'Retainer';

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface IProjectManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface IProject {
  id: string;
  projectName: string;
  costCenter: CostCenter;
  clientName: string;
  projectType: ProjectType;
  projectManager: IProjectManager;
  teamMembers: ITeamMember[];
  startDate: Date;
  endDate: Date | null;
  billable: boolean;
  status: 'Active' | 'Completed' | 'On Hold';
  createdAt: Date;
  updatedAt: Date;
}
