import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import logger from '../utils/logger';

const userService = new UserService();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await userService.getProfile(username);
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, bio, avatar, githubUrl, linkedinUrl } = req.body;
    const user = await userService.updateProfile(userId, {
      firstName, lastName, bio, avatar, githubUrl, linkedinUrl,
    });
    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const stats = await userService.getUserStats(userId);
    res.status(200).json({ success: true, stats });
  } catch (error: any) {
    logger.error('Get stats error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};
