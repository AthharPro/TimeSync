import mongoose from 'mongoose';
import { IProjectDocument } from '../interfaces';
import { BillableType } from '@tms/shared';



const projectSchema = new mongoose.Schema<IProjectDocument>(
  {
    projectName: { type: String, required: true },
    startDate:{ type: Date},
    endDate:{ type: Date},
    description:{ type: String},
    isPublic: { type: Boolean, required: true },
    clientName: { type: String},
    costCenter: { type: String},
    projectType: { type: String},
    billable: { type: String, enum: Object.values(BillableType)},
    employees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        allocation: { type: Number, default: 0 },
      },
    ],
    status: { type: Boolean, default: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model<IProjectDocument>('Project', projectSchema);
export default ProjectModel;
