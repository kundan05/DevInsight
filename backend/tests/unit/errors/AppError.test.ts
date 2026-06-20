import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
} from '../../../src/errors/AppError';

describe('AppError', () => {
  it('should create base AppError with correct status', () => {
    const error = new AppError('Test error', 418);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(418);
    expect(error.isOperational).toBe(true);
  });

  it('should set isOperational to false when specified', () => {
    const error = new AppError('Non-operational', 500, false);
    expect(error.isOperational).toBe(false);
  });
});

describe('NotFoundError', () => {
  it('should create with 404 status and resource name', () => {
    const error = new NotFoundError('User');
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });
});

describe('ValidationError', () => {
  it('should create with 400 status', () => {
    const error = new ValidationError('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
  });

  it('should include errors array', () => {
    const errors = ['email is required', 'password too short'];
    const error = new ValidationError('Validation Error', errors);
    expect(error.errors).toEqual(errors);
  });
});

describe('AuthError', () => {
  it('should create with 401 status', () => {
    const error = new AuthError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication required');
  });
});

describe('ForbiddenError', () => {
  it('should create with 403 status', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
  });
});

describe('ConflictError', () => {
  it('should create with 409 status', () => {
    const error = new ConflictError('Email already exists');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Email already exists');
  });
});

describe('RateLimitError', () => {
  it('should create with 429 status', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
  });
});
