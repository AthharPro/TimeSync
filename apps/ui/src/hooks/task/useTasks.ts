import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTasksByProject, createNewTask } from '../../store/slices/taskSlice';
import { CreateTaskParams } from '../../api/task';

export const useTasks = (projectId?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const tasksByProject = useSelector((state: RootState) => state.tasks.tasksByProject);
  const loading = useSelector((state: RootState) => state.tasks.loading);
  const error = useSelector((state: RootState) => state.tasks.error);

  const tasks = projectId ? tasksByProject[projectId] || [] : [];

  const loadTasks = useCallback(
    async (projId: string) => {
      await dispatch(fetchTasksByProject(projId));
    },
    [dispatch]
  );

  const createTask = useCallback(
    async (params: CreateTaskParams) => {
      const result = await dispatch(createNewTask(params));
      return result.payload;
    },
    [dispatch]
  );

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
  };
};
