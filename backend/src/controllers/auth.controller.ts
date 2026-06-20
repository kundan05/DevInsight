import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    const result = await authService.register({ email, username, password, firstName, lastName });
    res.status(201).json({ success: true, message: 'User registered successfully', ...result });
  } catch (error: any) {
    logger.error('Register error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, message: 'Login successful', ...result });
  } catch (error: any) {
    logger.error('Login error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    logger.error('Logout error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    const status = error.statusCode || 401;
    res.status(status).json({ success: false, message: error.message || 'Invalid refresh token' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = await authService.getCurrentUser(req.user.userId);
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Internal server error' });
  }
};
