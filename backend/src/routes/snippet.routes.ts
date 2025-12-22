import express from 'express';
import * as snippetController from '../controllers/snippet.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', snippetController.getAllSnippets);
router.get('/:id', snippetController.getSnippetById);
router.post('/', authenticate, snippetController.createSnippet);
router.put('/:id', authenticate, snippetController.updateSnippet);
router.delete('/:id', authenticate, snippetController.deleteSnippet);
router.post('/:id/like', authenticate, snippetController.likeSnippet);
router.post('/:id/comments', authenticate, snippetController.addComment);

export default router;
