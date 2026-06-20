import express from 'express';
import * as snippetController from '../controllers/snippet.controller';
import { authenticate } from '../middleware/auth';
import { validate, createSnippetSchema, updateSnippetSchema } from '../middleware/validation';
import { snippetCreateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/', snippetController.getAllSnippets);
router.get('/:id', snippetController.getSnippetById);
router.post('/', authenticate, snippetCreateLimiter, validate(createSnippetSchema), snippetController.createSnippet);
router.put('/:id', authenticate, validate(updateSnippetSchema), snippetController.updateSnippet);
router.delete('/:id', authenticate, snippetController.deleteSnippet);
router.post('/:id/like', authenticate, snippetController.likeSnippet);
router.post('/:id/comments', authenticate, snippetController.addComment);

export default router;
