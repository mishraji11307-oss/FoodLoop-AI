import { Router } from 'express';
import {
  scanFoodLabel,
  getScanHistory,
  getAllergenPreferences,
  updateAllergenPreferences
} from '../controllers/foodLabelController';
import {
  getProductByBarcode,
  searchProducts
} from '../controllers/openFoodFactsController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/requestValidator';
import {
  scanFoodLabelSchema,
  updateAllergenPreferencesSchema
} from '../validators/foodLabelSchemas';

const router = Router();

// Public / Demo scanning endpoint
router.post('/scan', validateRequest(scanFoodLabelSchema), scanFoodLabel);
router.get('/history', getScanHistory);

// Open Food Facts Barcode & Search Endpoints
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/search', searchProducts);

// Authenticated allergen management
router.get('/preferences', authenticate, getAllergenPreferences);
router.put('/preferences', authenticate, validateRequest(updateAllergenPreferencesSchema), updateAllergenPreferences);

export default router;
