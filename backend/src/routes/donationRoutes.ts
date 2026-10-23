import { Router } from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  requestDonation,
  getDonationRequests,
  acceptDonationRequest,
  rejectDonationRequest,
  confirmPickup,
  confirmDelivery
} from '../controllers/donationController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/requestValidator';
import {
  createDonationSchema,
  requestDonationSchema,
  pickupConfirmationSchema,
  deliveryConfirmationSchema
} from '../validators/donationSchemas';

const router = Router();

// Publicly viewable available listings
router.get('/', getDonations);
router.get('/:id', getDonationById);

// Donor Surplus Creation
router.post(
  '/',
  authenticate,
  requireRoles('donor', 'admin'),
  validateRequest(createDonationSchema),
  createDonation
);

// NGO Claims & Requests
router.post(
  '/:id/requests',
  authenticate,
  requireRoles('ngo', 'admin'),
  validateRequest(requestDonationSchema),
  requestDonation
);

router.get(
  '/:id/requests',
  authenticate,
  getDonationRequests
);

// Pickup and Delivery Handover OTP Confirmations
router.post(
  '/:id/pickup-confirmation',
  authenticate,
  validateRequest(pickupConfirmationSchema),
  confirmPickup
);

router.post(
  '/:id/delivery-confirmation',
  authenticate,
  validateRequest(deliveryConfirmationSchema),
  confirmDelivery
);

export default router;
