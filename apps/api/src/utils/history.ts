import HistoryModel from '../models/history.model';
import { HistoryActionType, HistoryEntityType } from '../interfaces/history';
import mongoose from 'mongoose';

interface CreateHistoryLogParams {
  actionType: HistoryActionType;
  entityType: HistoryEntityType;
  entityId: any;
  entityName: string;
  performedBy: any;
  performedByName: string;
  performedByEmail: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Create a history log entry
 */
export const createHistoryLog = async (params: CreateHistoryLogParams) => {
  try {
    const historyEntry = new HistoryModel({
      actionType: params.actionType,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      performedBy: params.performedBy,
      performedByName: params.performedByName,
      performedByEmail: params.performedByEmail,
      description: params.description,
      metadata: params.metadata || {},
    });

    await historyEntry.save();
    return historyEntry;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate user-friendly description for history actions
 */
export const generateHistoryDescription = (
  actionType: HistoryActionType,
  entityName: string,
  metadata?: Record<string, any>
): string => {
  switch (actionType) {
    // User actions
    case HistoryActionType.USER_CREATED:
      return `Created new user "${entityName}"`;
    case HistoryActionType.USER_UPDATED:
      return `Updated user "${entityName}"`;
    case HistoryActionType.USER_STATUS_CHANGED:
      return `Changed status of user "${entityName}" to ${metadata?.status ? 'Active' : 'Inactive'}`;
    case HistoryActionType.USER_PASSWORD_CHANGED:
      return `Changed password for user "${entityName}"`;

    // Project actions
    case HistoryActionType.PROJECT_CREATED:
      return `Created new project "${entityName}"`;
    case HistoryActionType.PROJECT_UPDATED:
      return `Updated project "${entityName}"`;
    case HistoryActionType.PROJECT_SUPERVISOR_CHANGED:
      return `Changed supervisor of project "${entityName}" to ${metadata?.newSupervisorName || 'None'}`;
    case HistoryActionType.PROJECT_EMPLOYEE_ADDED:
      return `Added ${metadata?.employeeName || 'employee'} to project "${entityName}"`;
    case HistoryActionType.PROJECT_EMPLOYEE_REMOVED:
      return `Removed ${metadata?.employeeName || 'employee'} from project "${entityName}"`;
    case HistoryActionType.PROJECT_STATUS_CHANGED:
      return `Changed status of project "${entityName}" to ${metadata?.status ? 'Active' : 'Inactive'}`;

    // Team actions
    case HistoryActionType.TEAM_CREATED:
      return `Created new team "${entityName}"`;
    case HistoryActionType.TEAM_UPDATED:
      return `Updated team "${entityName}"`;
    case HistoryActionType.TEAM_SUPERVISOR_CHANGED:
      return `Changed supervisor of team "${entityName}" to ${metadata?.newSupervisorName || 'None'}`;
    case HistoryActionType.TEAM_MEMBER_ADDED:
      return `Added ${metadata?.memberName || 'member'} to team "${entityName}"`;
    case HistoryActionType.TEAM_MEMBER_REMOVED:
      return `Removed ${metadata?.memberName || 'member'} from team "${entityName}"`;
    case HistoryActionType.TEAM_STATUS_CHANGED:
      return `Changed status of team "${entityName}" to ${metadata?.status ? 'Active' : 'Inactive'}`;

    default:
      return `Performed action on ${entityName}`;
  }
};
