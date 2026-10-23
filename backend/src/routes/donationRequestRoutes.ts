import { Router } from 'express';
import { acceptDonationRequest, rejectDonationRequest } from '../controllers/donationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/:id/accept', acceptDonationRequest);
router.post('/:id/reject', rejectDonationRequest);

export default router;
