import mongoose, { Document } from 'mongoose';

export enum HistoryActionType {
  // User actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
  
  // Project actions
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_SUPERVISOR_CHANGED = 'PROJECT_SUPERVISOR_CHANGED',
  PROJECT_EMPLOYEE_ADDED = 'PROJECT_EMPLOYEE_ADDED',
  PROJECT_EMPLOYEE_REMOVED = 'PROJECT_EMPLOYEE_REMOVED',
  PROJECT_STATUS_CHANGED = 'PROJECT_STATUS_CHANGED',
  
  // Team actions
  TEAM_CREATED = 'TEAM_CREATED',
  TEAM_UPDATED = 'TEAM_UPDATED',
  TEAM_SUPERVISOR_CHANGED = 'TEAM_SUPERVISOR_CHANGED',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED = 'TEAM_MEMBER_REMOVED',
  TEAM_STATUS_CHANGED = 'TEAM_STATUS_CHANGED',
}

export enum HistoryEntityType {
  USER = 'USER',
  PROJECT = 'PROJECT',
  TEAM = 'TEAM',
}

export interface IHistoryDocument extends Document {
  actionType: HistoryActionType;
  entityType: HistoryEntityType;
  entityId: mongoose.Schema.Types.ObjectId;
  entityName: string;
  performedBy: mongoose.Schema.Types.ObjectId;
  performedByName: string;
  performedByEmail: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
