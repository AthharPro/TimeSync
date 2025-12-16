import mongoose, { Document } from 'mongoose';

export interface ITeam extends Document {
  teamName: string;
  members: mongoose.Types.ObjectId[];
  supervisor?: mongoose.Types.ObjectId | null;
  status: boolean;
  isDepartment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamDocument extends mongoose.Document, ITeam {}

export interface ICreateTeamParams {
  teamName: string;
  members?: mongoose.Types.ObjectId[];
  supervisor?: mongoose.Types.ObjectId;
  status?: boolean;
  isDepartment?: boolean;
}

export interface IUpdateTeamParams extends Partial<ICreateTeamParams> {
  _id?: string;
}

export interface CreateTeamParams {
  teamName: string;
  members?: string[];
  supervisor?: string | null;
  status?: boolean;
  isDepartment?: boolean;
}