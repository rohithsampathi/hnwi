// lib/validation.ts - Input validation utilities for API security

import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(1000, 'Password too long'), // Prevent DoS attacks
  rememberDevice: z
    .boolean()
    .optional()
    .default(false)
});

// User creation/update validation schema  
export const userSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .trim(),
  lastName: z
    .string()
    .max(100, 'Last name too long')
    .trim()
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(1000, 'Password too long')
    .optional(),
  net_worth: z
    .number()
    .min(0, 'Net worth cannot be negative')
    .max(1000000000000, 'Net worth too large') // 1 trillion max
    .optional(),
  city: z
    .string()
    .max(100, 'City name too long')
    .trim()
    .optional(),
  country: z
    .string()
    .max(100, 'Country name too long')
    .trim()
    .optional(),
  bio: z
    .string()
    .max(1000, 'Bio too long')
    .trim()
    .optional(),
  industries: z
    .array(z.string().max(100, 'Industry name too long'))
    .max(20, 'Too many industries')
    .optional(),
  phone_number: z
    .string()
    .max(50, 'Phone number too long')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  office_address: z
    .string()
    .max(500, 'Office address too long')
    .trim()
    .optional(),
  linkedin: z
    .string()
    .url('Invalid LinkedIn URL')
    .max(200, 'LinkedIn URL too long')
    .optional()
    .or(z.literal('')),
  crypto_investor: z.boolean().optional(),
  land_investor: z.boolean().optional()
});

// Asset validation schema for Crown Vault
export const assetSchema = z.object({
  name: z
    .string()
    .min(1, 'Asset name is required')
    .max(200, 'Asset name too long')
    .trim(),
  asset_type: z
    .string()
    .min(1, 'Asset type is required')
    .max(100, 'Asset type too long')
    .trim(),
  value: z
    .number()
    .min(0, 'Asset value cannot be negative')
    .max(1000000000000, 'Asset value too large'), // 1 trillion max
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .toUpperCase(),
  location: z
    .string()
    .max(500, 'Location too long')
    .trim()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes too long')
    .trim()
    .optional(),
  heir_ids: z
    .array(z.string().uuid('Invalid heir ID format'))
    .max(50, 'Too many heirs')
    .optional(),
  heir_names: z
    .array(z.string().max(200, 'Heir name too long'))
    .max(50, 'Too many heir names')
    .optional()
});

// Query parameter validation
export const queryParamSchema = z.object({
  owner_id: z
    .string()
    .uuid('Invalid owner ID format')
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n >= 1 && n <= 1000, 'Page out of range')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n >= 1 && n <= 100, 'Limit out of range')
    .optional()
});

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Generic validation function
export function validateInput<T>(
  schema: z.ZodSchema<T>, 
  input: unknown
): ValidationResult<T> {
  try {
    const data = schema.parse(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Request size limits (to prevent DoS)
export const REQUEST_LIMITS = {
  MAX_JSON_SIZE: 1024 * 1024, // 1MB
  MAX_ARRAY_LENGTH: 1000,
  MAX_STRING_LENGTH: 10000,
  MAX_NESTED_DEPTH: 10
};

// Sanitize HTML to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim();
}

// Rate limiting helper
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  API: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  SENSITIVE: { windowMs: 60 * 1000, maxRequests: 10 } // 10 requests per minute for sensitive ops
};