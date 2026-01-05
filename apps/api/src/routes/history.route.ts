import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { getHistory, getEntityHistory, getRecentHistory } from '../controllers/history.controller';

const router = Router();

// Get all history entries with pagination and filtering
router.get('/', authenticate(), getHistory);

// Get recent history entries
router.get('/recent', authenticate(), getRecentHistory);

// Get history for a specific entity
router.get('/:entityType/:entityId', authenticate(), getEntityHistory);

export default router;
