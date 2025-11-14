import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  supervisor?: mongoose.Types.ObjectId;
  employees?: mongoose.Types.ObjectId[];
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    supervisor: { type: Schema.Types.ObjectId, ref: 'User' },
    employees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);

export default ProjectModel;
