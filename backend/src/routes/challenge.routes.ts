import express from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', challengeController.getAllChallenges);
router.get('/leaderboard', challengeController.getLeaderboard); // Specific routes before param routes
router.get('/:id', challengeController.getChallengeById);
router.post('/:id/submit', authenticate, challengeController.submitSolution);
router.post('/:id/run', authenticate, challengeController.runSolution);
router.get('/my-submissions', authenticate, challengeController.getUserSubmissions);


export default router;
