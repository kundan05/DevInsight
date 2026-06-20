import { Request, Response } from 'express';
import { ChallengeService } from '../services/challenge.service';
import logger from '../utils/logger';

const challengeService = new ChallengeService();

export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    const { difficulty, category, status, search, page, limit } = req.query;
    const result = await challengeService.getAll({
      difficulty: difficulty as string,
      category: category as string,
      status: status as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Get all challenges error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getChallengeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = await challengeService.getById(id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.status(200).json({ success: true, challenge });
  } catch (error: any) {
    logger.error('Get challenge error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const submitSolution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { code, language } = req.body;

    const result = await challengeService.submit(id, userId, code, language);
    res.status(200).json({
      success: true,
      submission: result.submission,
      message: result.passed ? 'Solution Accepted!' : 'Wrong Answer',
    });
  } catch (error: any) {
    logger.error('Submit solution error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const runSolution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, language } = req.body;
    const executionResult = await challengeService.run(id, code, language);
    res.status(200).json({ success: true, results: executionResult });
  } catch (error: any) {
    logger.error('Run solution error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await challengeService.getLeaderboard();
    res.status(200).json({ success: true, leaderboard });
  } catch (error: any) {
    logger.error('Get leaderboard error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const submissions = await challengeService.getUserSubmissions(userId);
    res.status(200).json({ success: true, submissions });
  } catch (error: any) {
    logger.error('Get user submissions error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};
