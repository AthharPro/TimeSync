import mongoose from 'mongoose';
import { IProjectDocument } from '../interfaces';
import { BillableType } from '@tms/shared';



const projectSchema = new mongoose.Schema<IProjectDocument>(
  {
    projectName: { type: String, required: true },
    startDate:{ type: Date, required: false },
    endDate:{ type: Date, required: false },
    description:{ type: String, required: true },
    isPublic: { type: Boolean, required: true },
    clientName: { type: String, required: true },
    costCenter: { type: String, required: true },
    projectType: { type: String,required:true},
    billable: { type: String, enum: Object.values(BillableType), required: true },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    status: { type: Boolean, default: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model<IProjectDocument>('Project', projectSchema);
export default ProjectModel;
