import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  supervisor?: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeamDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    supervisor: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const TeamModel = mongoose.model<ITeamDocument>('Team', TeamSchema);

export default TeamModel;
