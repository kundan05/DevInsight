import { Request, Response, NextFunction } from 'express';
import 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AuthError } from '../errors/AppError';
import { UserRepository } from '../repositories/UserRepository';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

const userRepo = new UserRepository();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      throw new AuthError('User validation failed');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
    }

    next();
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {
    // Ignore auth errors for optional auth
  }

  next();
};
