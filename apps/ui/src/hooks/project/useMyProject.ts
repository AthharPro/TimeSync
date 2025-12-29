import { useState, useCallback, useEffect } from 'react';
import { listProjects } from '../../api/project';
import { MyProject } from '../../interfaces/project/IProject';

export interface UseMyProjectsReturn {
  myProjects: MyProject[];
  loading: boolean;
  error: string | null;
  loadMyProjects: () => Promise<void>;
}

export const useMyProjects = (): UseMyProjectsReturn => {
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMyProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listProjects();
      // Backend returns { projects: [...] }
      const projects = response.projects || [];
      setMyProjects(projects);
    } catch (err: any) {
      console.error('Failed to load my projects:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load my projects');
      setMyProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    myProjects,
    loading,
    error,
    loadMyProjects,
  };
};
