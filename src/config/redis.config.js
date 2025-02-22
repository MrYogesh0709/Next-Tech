import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { constants } from '../utils/constant.js';
import { env } from '../utils/env.js';

const MAX_RETRIES = constants.REDIS_MAX_RETRIES;

export const redis = new Redis({
  host: env.REDIS_HOST || 'localhost',
  port: env.REDIS_PORT || 6379,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    if (times > MAX_RETRIES) {
      console.error('❌ Redis failed to connect after max retries. Exiting process.');
      process.exit(1);
    }

    const delay = Math.min(1000 * 2 ** times, 30000); // Exponential backoff (max 30 sec)
    console.warn(`⚠️ Redis connection failed. Retrying in ${delay / 1000} seconds...`);
    return delay;
  },
  reconnectOnError: (err) => {
    console.error('⚠️ Redis encountered an error:', err.message);
    return true;
  },
});

redis.on('connect', () => {
  console.log(`✅ Redis is connected on ${redis.options.host}:${redis.options.port}`);
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
  process.exit(1);
});

export const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'auth_limit',
  points: 10, // Allow 10 login attempts
  duration: 15 * 60, // Per 15 min
  blockDuration: 10 * 60, // Block for 10 min (was 30 min)
});

export const generalRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'general_limit',
  points: 300, // Allow 300 requests
  duration: 5 * 60, // Per 5 min
});
