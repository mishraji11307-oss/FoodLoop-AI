import { Router } from 'express';
import { scanImage } from '../controllers/ocrController';

const router = Router();

// OCR image scanning endpoint (works for both receipts and food packaging labels)
router.post('/scan', scanImage);

export default router;
