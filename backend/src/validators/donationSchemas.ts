import { z } from 'zod';

export const createDonationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  food_category: z.string().min(2, 'Food category is required'),
  quantity_kg: z.number().positive('Quantity (kg) must be greater than zero'),
  servings_estimate: z.number().int().positive('Servings estimate must be positive'),
  perishable: z.boolean().default(true),
  prepared_at: z.string().optional(),
  expiry_time: z.string().min(10, 'Expiry time ISO string is required'),
  pickup_address: z.string().min(5, 'Pickup address is required'),
  pickup_latitude: z.number().min(-90).max(90),
  pickup_longitude: z.number().min(-180).max(180),
  pickup_window_start: z.string().min(10, 'Pickup window start is required'),
  pickup_window_end: z.string().min(10, 'Pickup window end is required'),
  dietary_attributes: z.array(z.string()).default(['vegetarian']),
  packaging_notes: z.string().optional(),
  donor_org_id: z.string().optional()
});

export const updateDonationSchema = createDonationSchema.partial();

export const requestDonationSchema = z.object({
  ngo_id: z.string().min(1, 'NGO organization ID is required'),
  request_notes: z.string().optional()
});

export const pickupConfirmationSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  temperature_celsius: z.number().optional(),
  notes: z.string().optional()
});

export const deliveryConfirmationSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  beneficiaries_served: z.number().int().nonnegative().optional(),
  confirmation_notes: z.string().optional(),
  confirmation_photo_url: z.string().url().optional()
});

export const verifyOrganizationSchema = z.object({
  verification_status: z.enum(['verified', 'rejected']),
  reason: z.string().optional()
});
