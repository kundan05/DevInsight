import express from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth';
import { validate, submitChallengeSchema } from '../middleware/validation';
import { challengeSubmissionLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/', challengeController.getAllChallenges);
router.get('/leaderboard', challengeController.getLeaderboard);
router.get('/my-submissions', authenticate, challengeController.getUserSubmissions);
router.get('/:id', challengeController.getChallengeById);
router.post('/:id/submit', authenticate, challengeSubmissionLimiter, validate(submitChallengeSchema), challengeController.submitSolution);
router.post('/:id/run', authenticate, challengeSubmissionLimiter, validate(submitChallengeSchema), challengeController.runSolution);

export default router;
