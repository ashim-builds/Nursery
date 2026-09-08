import { z } from 'zod';

// Strict Name: Cannot contain numeric digits
export const nameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(70, 'Full name must not exceed 70 characters')
  .regex(
    /^[a-zA-Z\s\.\'-]+$/,
    'Full name cannot contain numbers or special characters'
  );

// Strict Phone: Exactly 10 digits, starts with 9
export const phoneSchema = z
  .string()
  .regex(/^[9][0-9]{9}$/, 'Phone number must be exactly 10 digits and start with 9');

// Strict Email: Normalized lowercase
export const emailSchema = z
  .string()
  .email('Please provide a valid email address')
  .transform((val) => val.toLowerCase().trim());

export const registerSchema = z.object({
  body: z.object({
    fullName: nameSchema,
    email: emailSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: phoneSchema.optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: nameSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});
