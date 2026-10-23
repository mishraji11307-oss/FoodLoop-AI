import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';

const router = Router();

// Public platform analytics endpoint
router.get('/', getAnalytics);

export default router;
