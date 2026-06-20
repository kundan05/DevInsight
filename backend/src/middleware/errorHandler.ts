import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import logger from '../utils/logger';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    const statusCode = error.statusCode;

    logger.warn(`${statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const response: any = {
      success: false,
      message: error.message,
    };

    if ('errors' in error && (error as any).errors) {
      response.errors = (error as any).errors;
    }

    return res.status(statusCode).json(response);
  }

  logger.error(`${500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(error.stack || 'No stack trace');

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
