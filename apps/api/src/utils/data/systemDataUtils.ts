import Project from '../../models/project.model';
import {Task} from '../../models/task.model';

export async function ensureInternalProject() {
  const exists = await Project.findOne({ projectName: "Internal", isPublic: true });


  if (!exists) {
   const res=await Project.create({
      projectName: "Internal",
      isPublic: "true"
    });
    
    await Task.create({
      projectId: res._id,
      taskName: "Time Off"
    });
  }
  }

