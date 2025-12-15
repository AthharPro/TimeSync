import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { fetchMyProjects, createProject } from "../../store/slices/myProjectSlice";
import type { RootState, AppDispatch } from "../../store/store";

export const useMyProjects = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { myProjects, loading, error } = useSelector(
    (state: RootState) => state.myProjects
  );

  const loadMyProjects = useCallback(() => {
    dispatch(fetchMyProjects());
  }, [dispatch]);

  const createNewProject = useCallback(
    async (params: { projectName: string; clientName?: string; billable?: string }) => {
      const result = await dispatch(createProject(params));
      return result.payload;
    },
    [dispatch]
  );

  return {
    myProjects,
    loading,
    error,
    loadMyProjects,
    createNewProject,
  };
};
