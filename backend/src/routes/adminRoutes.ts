import { Router } from 'express';
import {
  getOrganizations,
  verifyOrganization,
  getModerationLogs
} from '../controllers/adminController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/requestValidator';
import { verifyOrganizationSchema } from '../validators/donationSchemas';

const router = Router();

router.use(authenticate, requireRoles('admin'));

router.get('/organizations', getOrganizations);
router.patch('/organizations/:id/verify', validateRequest(verifyOrganizationSchema), verifyOrganization);
router.get('/moderation', getModerationLogs);

export default router;
