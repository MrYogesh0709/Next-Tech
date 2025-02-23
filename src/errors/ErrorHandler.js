import { ApiError } from './ApiErrors.js';
import { isDevelopment } from '../utils/constant.js';
import { logger } from '../utils/logger.util.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : err instanceof SyntaxError ? 400 : 500;
  const message =
    err instanceof ApiError ? err.message : err instanceof SyntaxError ? 'Malformed JSON' : 'Internal Server Error';

  logger.error('API Error', {
    statusCode,
    message,
    stack: err.stack,
    errors: err.errors || [],
    data: err.data || null,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    data: err.data || null,
    stack: isDevelopment ? err.stack : undefined,
  });
};
