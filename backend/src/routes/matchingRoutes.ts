import { Router } from 'express';
import { getMatchingRecommendations } from '../controllers/matchingController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/recommendations', authenticate, requireRoles('ngo', 'admin'), getMatchingRecommendations);

export default router;
