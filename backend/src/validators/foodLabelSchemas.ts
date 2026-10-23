import { z } from 'zod';

export const scanFoodLabelSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  raw_text: z.string().min(3, 'Label text or OCR string is required'),
  user_allergens: z.array(z.string()).default([]),
  image_url: z.string().optional()
});

export const updateAllergenPreferencesSchema = z.object({
  allergens: z.array(z.string()),
  dietary_flags: z.array(z.string()).default([]),
  strictness_level: z.enum(['warning', 'strict']).default('warning')
});
