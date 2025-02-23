import { ZodError } from 'zod';
import { ImageSchema } from '../validator/image.validate.js';
import { ApiError } from '../../errors/ApiErrors.js';
import { logger } from '../../utils/logger.util.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Validation failed', {
        path: req.originalUrl,
        method: req.method,
        errors: error.errors,
      });

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors,
      });
    } else {
      logger.error('Unexpected validation error', {
        path: req.originalUrl,
        method: req.method,
        error: error.message,
      });
      next(error);
    }
  }
};

export const validateImageUpload = (req, res, next) => {
  if (!req.file) {
    logger.warn('Image upload failed: No file uploaded', { path: req.originalUrl, method: req.method });
    throw new ApiError(400, 'No file uploaded');
  }

  const validation = ImageSchema.safeParse(req.file);
  if (!validation.success) {
    logger.warn('Image upload validation failed', {
      path: req.originalUrl,
      method: req.method,
      errors: validation.error.errors.map((e) => e.message),
    });

    throw new ApiError(400, validation.error.errors.map((e) => e.message).join(', '));
  }

  logger.info('Image upload validation passed', {
    path: req.originalUrl,
    method: req.method,
    filename: req.file.filename,
  });

  next();
};
