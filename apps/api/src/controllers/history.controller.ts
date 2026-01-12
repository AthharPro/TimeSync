import { Request, Response } from 'express';
import HistoryModel from '../models/history.model';
import { UserModel } from '../models/user.model';
import { OK, INTERNAL_SERVER_ERROR } from '../constants';
import { UserRole } from '@tms/shared';

/**
 * Get all history entries with pagination and filtering
 * @route GET /api/history
 */
export const getHistory = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      entityType,
      entityId,
      performedBy,
      startDate,
      endDate,
      excludeSuperAdmin,
    } = req.query;

    const query: any = {};

    // Apply filters
    if (entityType) {
      query.entityType = entityType;
    }

    if (entityId) {
      query.entityId = entityId;
    }

    if (performedBy) {
      query.performedBy = performedBy;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }

    // Exclude history entries performed by SuperAdmins if requested
    if (excludeSuperAdmin === 'true') {
      const superAdminUsers = await UserModel.find({ role: UserRole.SuperAdmin }).select('_id').lean();
      const superAdminIds = superAdminUsers.map((user: any) => user._id);
      
      if (superAdminIds.length > 0) {
        query.performedBy = { $nin: superAdminIds };
      }
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await HistoryModel.countDocuments(query);

    // Get history entries
    const history = await HistoryModel.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNum)
      .populate('performedBy', 'firstName lastName email')
      .lean();

    res.status(OK).json({
      success: true,
      data: history,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get history entries for a specific entity
 * @route GET /api/history/:entityType/:entityId
 */
export const getEntityHistory = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      entityType: entityType.toUpperCase(),
      entityId,
    };

    const total = await HistoryModel.countDocuments(query);

    const history = await HistoryModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('performedBy', 'firstName lastName email')
      .lean();

    res.status(OK).json({
      success: true,
      data: history,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching entity history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get recent history entries
 * @route GET /api/history/recent
 */
export const getRecentHistory = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    const history = await HistoryModel.find()
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .populate('performedBy', 'firstName lastName email')
      .lean();

    res.status(OK).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching recent history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
