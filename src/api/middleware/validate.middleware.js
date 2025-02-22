import { ZodError } from 'zod';
import { ImageSchema } from '../validator/image.validate.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors,
      });
    } else {
      next(error);
    }
  }
};

export const validateImageUpload = (req, res, next) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const validation = ImageSchema.safeParse(req.file);
  if (!validation.success) {
    throw new ApiError(400, validation.error.errors.map((e) => e.message).join(', '));
  }

  next();
};
