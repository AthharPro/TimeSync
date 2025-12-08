import { Task } from '../models';
import { ITaskDocument } from '../interfaces';

interface CreateTaskParams {
  projectId: string;
  taskName: string;
}

export const createTask = async (
  params: CreateTaskParams
): Promise<ITaskDocument> => {
  const task = new Task({
    projectId: params.projectId,
    taskName: params.taskName,
  });

  return await task.save();
};
