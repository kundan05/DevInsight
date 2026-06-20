import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
      });
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false, allowUnknown: true });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors,
      });
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid path parameters',
        errors,
      });
    }

    next();
  };
};

// Auth schemas
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'password strength')
    .message('Password must contain uppercase, lowercase, and number')
    .required(),
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Snippet schemas
export const createSnippetSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(2000).allow('').optional(),
  code: Joi.string().required(),
  language: Joi.string().valid('javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'ruby', 'php').required(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  isPublic: Joi.boolean().optional(),
});

export const updateSnippetSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(2000).allow('').optional(),
  code: Joi.string().optional(),
  language: Joi.string().valid('javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'ruby', 'php').optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  isPublic: Joi.boolean().optional(),
}).min(1).message('At least one field must be provided for update');

// User schemas
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  bio: Joi.string().max(500).allow('').optional(),
  avatar: Joi.string().uri().optional(),
  githubUrl: Joi.string().uri().allow('').optional(),
  linkedinUrl: Joi.string().uri().allow('').optional(),
});

// Challenge schemas
export const submitChallengeSchema = Joi.object({
  code: Joi.string().min(1).required(),
  language: Joi.string().valid('javascript', 'typescript', 'python', 'java').required(),
});

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});
