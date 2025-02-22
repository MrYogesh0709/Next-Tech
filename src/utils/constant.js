import { env } from './env.js';

export const constants = {
  ENVIRONMENT_DEVELOPMENT: 'development',
  JSON_LIMIT: '1mb',
  jwt: {
    secret: env.JWT_SECRET || 'your-secret-key',
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
    refreshExpiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  bcrypt: {
    saltRounds: 10,
  },
  REDIS_MAX_RETRIES: 10,
};

export const isDevelopment = env.NODE_ENV === constants.ENVIRONMENT_DEVELOPMENT;
