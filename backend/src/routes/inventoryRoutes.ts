import { Router } from 'express';
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryStatus,
  scanReceipt,
  getRecipeSuggestions
} from '../controllers/inventoryController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/requestValidator';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  updateInventoryStatusSchema,
  receiptScanSchema
} from '../validators/inventorySchemas';

const router = Router();

// Household inventory endpoints
router.use(authenticate);

router.get('/', requireRoles('household', 'admin'), getInventory);
router.post('/', requireRoles('household', 'admin'), validateRequest(createInventoryItemSchema), createInventoryItem);
router.get('/recipes', requireRoles('household', 'admin'), getRecipeSuggestions);
router.post('/receipt-scan', requireRoles('household', 'admin'), validateRequest(receiptScanSchema), scanReceipt);

router.get('/:id', requireRoles('household', 'admin'), getInventoryItem);
router.put('/:id', requireRoles('household', 'admin'), validateRequest(updateInventoryItemSchema), updateInventoryItem);
router.delete('/:id', requireRoles('household', 'admin'), deleteInventoryItem);
router.patch('/:id/status', requireRoles('household', 'admin'), validateRequest(updateInventoryStatusSchema), updateInventoryStatus);

export default router;
