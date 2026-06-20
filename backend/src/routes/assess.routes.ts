import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';
import * as assessController from '../controllers/assess.controller';
import { challengeSubmissionLimiter } from '../middleware/rateLimiter';

const router = Router();

const createAssessmentSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().required(),
  difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD', 'EXPERT').required(),
  category: Joi.string().required(),
  timeLimit: Joi.number().integer().min(60).max(86400).default(3600),
  passingScore: Joi.number().integer().min(0).max(100).default(70),
  questions: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required().min(3).max(200),
        description: Joi.string().required(),
        difficulty: Joi.string()
          .valid('EASY', 'MEDIUM', 'HARD', 'EXPERT')
          .required(),
        starterCode: Joi.string().allow(''),
        testCases: Joi.array()
          .items(
            Joi.object({
              input: Joi.any().required(),
              expectedOutput: Joi.any().required(),
              isHidden: Joi.boolean().default(false),
            }),
          )
          .min(1)
          .required(),
        points: Joi.number().integer().min(1).max(100).default(10),
      }),
    )
    .min(1)
    .required(),
});

const submitAnswerSchema = Joi.object({
  code: Joi.string().required().min(1),
  language: Joi.string()
    .valid('javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust')
    .required(),
});

router.get('/', assessController.getAllAssessments);
router.get('/my-results', authenticate, assessController.getUserAssessments);
router.get('/:id', assessController.getAssessmentById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INTERVIEWER'),
  validate(createAssessmentSchema),
  assessController.createAssessment,
);
router.post(
  '/:assessmentId/questions/:questionId/submit',
  authenticate,
  challengeSubmissionLimiter,
  validate(submitAnswerSchema),
  assessController.submitAnswer,
);
router.get(
  '/:assessmentId/evaluate',
  authenticate,
  assessController.evaluateAssessment,
);

export default router;
