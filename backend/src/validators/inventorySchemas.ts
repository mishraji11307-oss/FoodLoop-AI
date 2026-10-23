import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().min(1, 'Unit is required'),
  storage: z.enum(['fridge', 'pantry', 'freezer']).default('fridge'),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD').default(() => new Date().toISOString().slice(0, 10)),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  date_label: z.enum(['best_before', 'use_by', 'expiry']).default('expiry'),
  safety_guidance: z.string().optional(),
  is_opened: z.boolean().default(false),
  opened_date: z.string().optional(),
  notes: z.string().optional()
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const updateInventoryStatusSchema = z.object({
  status: z.enum(['fresh', 'expiring_soon', 'expired', 'consumed', 'wasted'])
});

export const receiptScanSchema = z.object({
  rawText: z.string().min(3, 'Receipt raw text or OCR string is required')
});
