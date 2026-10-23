import { Router } from 'express';
import authRoutes from './authRoutes';
import inventoryRoutes from './inventoryRoutes';
import foodLabelRoutes from './foodLabelRoutes';
import donationRoutes from './donationRoutes';
import donationRequestRoutes from './donationRequestRoutes';
import matchingRoutes from './matchingRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import adminRoutes from './adminRoutes';
import ocrRoutes from './ocrRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/food-labels', foodLabelRoutes);
router.use('/ocr', ocrRoutes);
router.use('/donations', donationRoutes);
router.use('/donation-requests', donationRequestRoutes);
router.use('/matching', matchingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodLoop AI API',
    timestamp: new Date().toISOString()
  });
});

export default router;
