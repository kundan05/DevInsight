import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import snippetRoutes from './snippet.routes';
import challengeRoutes from './challenge.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/snippets', snippetRoutes);
router.use('/challenges', challengeRoutes);

export default router;
