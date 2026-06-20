import express from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate, updateProfileSchema } from '../middleware/validation';

const router = express.Router();

router.get('/profile/:username', userController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.get('/stats', authenticate, userController.getUserStats);

export default router;
