import { authRateLimiter, generalRateLimiter } from '../../config/redis.config.js';
import { RateLimiterRes } from 'rate-limiter-flexible';
import { logger } from '../../utils/logger.util.js';

const setRateLimitHeaders = (res, rateLimiterRes, points) => {
  res.setHeader('RateLimit-Limit', points);
  res.setHeader('RateLimit-Remaining', rateLimiterRes.remainingPoints);
  res.setHeader('RateLimit-Reset', Math.ceil(Date.now() / 1000 + rateLimiterRes.msBeforeNext / 1000));

  res.setHeader('X-RateLimit-Limit', points);
  res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
  res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + rateLimiterRes.msBeforeNext / 1000));

  if (rateLimiterRes.remainingPoints === 0) {
    res.setHeader('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000));
  }
};

export const authLimiterMiddleware = async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    const rateLimiterRes = await authRateLimiter.consume(ipAddress);

    setRateLimitHeaders(res, rateLimiterRes, authRateLimiter.points);

    logger.info('Auth rate limit check passed', { ip: ipAddress, path: req.originalUrl });

    next();
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      setRateLimitHeaders(res, error, authRateLimiter.points);

      logger.warn('Auth rate limit exceeded', {
        ip: req.ip,
        path: req.originalUrl,
        remainingPoints: error.remainingPoints,
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });

      return res.status(429).json({
        status: 429,
        error: 'Too Many Requests',
        message: 'Too many login attempts, please try again later.',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      logger.error('Unexpected error in auth rate limiter', { error: error.message, ip: req.ip });
      next(error);
    }
  }
};

export const generalLimiterMiddleware = async (req, res, next) => {
  if (req.path.startsWith('/api/v1/auth')) {
    return next();
  }

  try {
    const ipAddress = req.ip;
    const rateLimiterRes = await generalRateLimiter.consume(ipAddress);

    setRateLimitHeaders(res, rateLimiterRes, generalRateLimiter.points);

    logger.info('General rate limit check passed', { ip: ipAddress, path: req.originalUrl });

    next();
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      setRateLimitHeaders(res, error, generalRateLimiter.points);

      logger.warn('General rate limit exceeded', {
        ip: req.ip,
        path: req.originalUrl,
        remainingPoints: error.remainingPoints,
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });

      res.status(429).json({
        status: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, please try again later.',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
      return;
    } else {
      logger.error('Unexpected error in general rate limiter', { error: error.message, ip: req.ip });
      next(error);
    }
  }
};
