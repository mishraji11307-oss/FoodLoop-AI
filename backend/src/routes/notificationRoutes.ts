import { Router } from 'express';
import { getNotifications, markNotificationRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
