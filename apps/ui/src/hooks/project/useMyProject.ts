import { useState, useCallback, useEffect } from 'react';
import { listMyProjects } from '../../api/project';
import { MyProject } from '../../interfaces/project/IProject';

export interface MyTeam {
  _id: string;
  teamName: string;
  isDepartment?: boolean;
}

export interface UseMyProjectsReturn {
  myProjects: MyProject[];
  myTeams: MyTeam[];
  loading: boolean;
  error: string | null;
  loadMyProjects: () => Promise<void>;
}

export const useMyProjects = (): UseMyProjectsReturn => {
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMyProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listMyProjects();
      console.log('useMyProjects - API Response:', response);
      // Backend returns { projects: [...], teams: [...] }
      const projects = response.projects || [];
      const teams = response.teams || [];
      console.log('useMyProjects - Extracted projects:', projects);
      console.log('useMyProjects - Extracted teams:', teams);
      setMyProjects(projects);
      setMyTeams(teams);
    } catch (err: any) {
      console.error('Failed to load my projects:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load my projects');
      setMyProjects([]);
      setMyTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    myProjects,
    myTeams,
    loading,
    error,
    loadMyProjects,
  };
};
