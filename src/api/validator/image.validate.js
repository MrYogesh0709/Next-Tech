import { z } from 'zod';

export const ImageSchema = z.object({
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/gif']).optional(),
  size: z.number().max(5 * 1024 * 1024, 'File must be under 5MB'),
});
