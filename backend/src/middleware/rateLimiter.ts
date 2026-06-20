import rateLimit from 'express-rate-limit';


const RATE_LIMIT_MULTIPLIER = process.env.NODE_ENV === 'development' ? 5 : 1;

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 * RATE_LIMIT_MULTIPLIER,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20 * RATE_LIMIT_MULTIPLIER,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
    });
  },
});

export const snippetCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50 * RATE_LIMIT_MULTIPLIER,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many snippets created, please try again later',
    });
  },
});

export const challengeSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10 * RATE_LIMIT_MULTIPLIER,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many submissions, please slow down',
    });
  },
});
