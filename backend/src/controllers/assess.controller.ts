import { Request, Response, NextFunction } from 'express';
import { AssessService } from '../services/assess.service';
import logger from '../utils/logger';

const assessService = new AssessService();

export const getAllAssessments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { difficulty, category, page, limit } = req.query;
    const result = await assessService.getAssessments({
      difficulty: difficulty as string,
      category: category as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assessment = await assessService.getAssessmentById(req.params.id);
    res.json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

export const createAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assessment = await assessService.createAssessment({
      ...req.body,
      authorId: req.user!.userId,
    });
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { assessmentId, questionId } = req.params;
    const { code, language } = req.body;
    const result = await assessService.submitAnswer(
      assessmentId,
      questionId,
      req.user!.userId,
      code,
      language,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const evaluateAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await assessService.evaluateAssessment(
      req.params.assessmentId,
      req.user!.userId,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getUserAssessments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const results = await assessService.getUserAssessments(req.user!.userId);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
