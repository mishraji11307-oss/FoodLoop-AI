import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/requestValidator';
import { loginSchema, registerSchema } from '../validators/authSchemas';

const router = Router();

router.get('/me', authenticate, getMe);
router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);

export default router;
