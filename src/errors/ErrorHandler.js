import { ApiError } from './ApiErrors.js';
import { isDevelopment } from '../utils/constant.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err instanceof ApiError ? err.statusCode : err instanceof SyntaxError ? 400 : 500;
  const message =
    err instanceof ApiError ? err.message : err instanceof SyntaxError ? 'Malformed JSON' : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    data: err.data || null,
    stack: isDevelopment ? err.stack : undefined,
  });
};
