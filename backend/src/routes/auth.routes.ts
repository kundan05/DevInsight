import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
