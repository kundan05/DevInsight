import { Request, Response } from 'express';
import { SnippetService } from '../services/snippet.service';
import logger from '../utils/logger';

const snippetService = new SnippetService();

export const getAllSnippets = async (req: Request, res: Response) => {
  try {
    const { language, tag, authorId, search, page, limit } = req.query;
    const result = await snippetService.getAll({
      language: language as string,
      tag: tag as string,
      authorId: authorId as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Get all snippets error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getSnippetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snippet = await snippetService.getById(id);
    res.status(200).json({ success: true, snippet });
  } catch (error: any) {
    logger.error('Get snippet error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const createSnippet = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, code, language, tags, isPublic } = req.body;
    const snippet = await snippetService.create(userId, {
      title, description, code, language, tags, isPublic,
    });
    res.status(201).json({ success: true, message: 'Snippet created successfully', snippet });
  } catch (error: any) {
    logger.error('Create snippet error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const updateSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { title, description, code, language, tags, isPublic } = req.body;
    const snippet = await snippetService.update(id, userId, userRole, {
      title, description, code, language, tags, isPublic,
    });
    res.status(200).json({ success: true, message: 'Snippet updated successfully', snippet });
  } catch (error: any) {
    logger.error('Update snippet error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    await snippetService.delete(id, userId, userRole);
    res.status(200).json({ success: true, message: 'Snippet deleted successfully' });
  } catch (error: any) {
    logger.error('Delete snippet error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const likeSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const liked = await snippetService.toggleLike(id, userId);
    const message = liked ? 'Snippet liked' : 'Snippet unliked';
    res.status(200).json({ success: true, message, liked });
  } catch (error: any) {
    logger.error('Like snippet error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content } = req.body;
    const comment = await snippetService.addComment(id, userId, content);
    res.status(201).json({ success: true, message: 'Comment added', comment });
  } catch (error: any) {
    logger.error('Add comment error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};
