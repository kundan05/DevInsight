import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
// import { authRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Add rate limiter later
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
