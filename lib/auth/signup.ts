import { z } from 'zod';

const phonePattern = /^\+[1-9]\d{7,14}$/;

export const passwordSchema = z.string().min(12, 'Use at least 12 characters.').max(128)
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/\d/, 'Include a number.')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol.');

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(254),
  phone: z.string().trim().regex(phonePattern, 'Use international format, for example +14155552671.'),
  organizationName: z.string().trim().min(2).max(100),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.literal('on'),
  acceptPrivacy: z.literal('on'),
}).refine((value) => value.password === value.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });

export function signupRedirectUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/auth/callback`;
}
