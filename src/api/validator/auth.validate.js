import { z } from 'zod';

const phoneRegex = /^[0-9]{10,15}$/; // Supports 10-15 digit phone numbers

export const UserSchemaRegister = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
    email: z.string().trim().toLowerCase().email('Invalid email format'),
    phone: z.string().trim().regex(phoneRegex, 'Phone number must be 10-15 digits long'),
    password: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
  })
  .strict();

export const UserSchemaLogin = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email format'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters'),
  })
  .strict();

export const UserSchemaUpdate = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
      .optional(),
    email: z.string().trim().toLowerCase().email('Invalid email format').optional(),
    phone: z.string().trim().regex(phoneRegex, 'Phone number must be 10-15 digits long').optional(),
  })
  .strict();

export const UserSchemaUpdatePassword = z
  .object({
    oldPassword: z.string().trim().min(8, 'Password must be at least 8 characters'),
    newPassword: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
  })
  .strict();
