import express from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/profile/:username', userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/stats', authenticate, userController.getUserStats);

export default router;
