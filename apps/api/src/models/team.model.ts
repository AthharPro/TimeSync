import mongoose from 'mongoose';
import { ITeamDocument } from '../interfaces';

const teamSchema = new mongoose.Schema<ITeamDocument>(
  {
    teamName: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: Boolean, default: true },
    isDepartment: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const TeamModel = mongoose.model<ITeamDocument>('Team', teamSchema);
export default TeamModel;








