import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must have at least 2 characters'),
  role: z.enum(['household', 'donor', 'ngo', 'admin']).default('household'),
  phone: z.string().optional(),
  preferred_language: z.string().default('en')
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  preferred_language: z.string().optional(),
  avatar_url: z.string().url().optional()
});
