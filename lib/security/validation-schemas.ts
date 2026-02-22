import { z } from "zod";

// Safety refinements for string fields (SQL injection + XSS)
const SQL_INJECTION_RE = /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|TRUNCATE)/i;
const XSS_RE_TAG = /<[^>]*>/;
const XSS_RE_JS = /javascript:/i;
const XSS_RE_EVT = /on\w+\s*=/i;

/** Create a safe string schema with min/max bounds and injection checks */
function safeStr(min?: number, max?: number) {
  let s = z.string();
  if (min !== undefined) s = s.min(min) as unknown as z.ZodString;
  if (max !== undefined) s = s.max(max) as unknown as z.ZodString;
  return s
    .refine((val) => !SQL_INJECTION_RE.test(val), { message: "Input contains potentially dangerous SQL keywords" })
    .refine((val) => !XSS_RE_TAG.test(val) && !XSS_RE_JS.test(val) && !XSS_RE_EVT.test(val), { message: "Input contains potentially dangerous HTML or JavaScript" });
}

// Email validation with additional security checks
export const emailSchema = z.string()
  .email("Invalid email format")
  .max(254, "Email too long")
  .toLowerCase()
  .refine(
    (email) => {
      // Check for common disposable email domains
      const disposableDomains = ["tempmail", "throwaway", "guerrillamail", "10minutemail"];
      return !disposableDomains.some(domain => email.includes(domain));
    },
    { message: "Disposable email addresses are not allowed" }
  )
  .refine(
    (email) => {
      // Ensure no special characters that could be used for attacks
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    },
    { message: "Email contains invalid characters" }
  );

// Password validation with strong requirements
export const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password too long")
  .refine(
    (password) => /[A-Z]/.test(password),
    { message: "Password must contain at least one uppercase letter" }
  )
  .refine(
    (password) => /[a-z]/.test(password),
    { message: "Password must contain at least one lowercase letter" }
  )
  .refine(
    (password) => /\d/.test(password),
    { message: "Password must contain at least one number" }
  )
  .refine(
    (password) => /[@$!%*?&#^()_+=\-{}\[\]|\\:;"'<>,.\/]/.test(password),
    { message: "Password must contain at least one special character" }
  )
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    { message: "Password cannot contain more than 2 consecutive identical characters" }
  )
  .refine(
    (password) => {
      // Check against common passwords
      const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"];
      return !commonPasswords.some(common => password.toLowerCase().includes(common));
    },
    { message: "Password is too common" }
  );

// User authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  mfaCode: z.string().length(6).regex(/^\d+$/, "MFA code must be 6 digits").optional()
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: safeStr(1, 50),
  lastName: safeStr(1, 50),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  consentToDataProcessing: z.boolean().refine(val => val === true, {
    message: "You must consent to data processing"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: safeStr(1, 50).optional(),
  lastName: safeStr(1, 50).optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  address: z.object({
    street: safeStr(undefined, 100).optional(),
    city: safeStr(undefined, 50).optional(),
    state: safeStr(undefined, 50).optional(),
    country: safeStr(undefined, 50).optional(),
    postalCode: z.string().max(20).optional()
  }).optional()
});

// Financial data schemas
export const assetSchema = z.object({
  name: safeStr(1, 100),
  type: z.enum(["REAL_ESTATE", "STOCKS", "BONDS", "CRYPTO", "COMMODITY", "CASH", "OTHER"]),
  value: z.number().positive().max(1e12), // Max $1 trillion
  currency: z.string().length(3).regex(/^[A-Z]{3}$/, "Invalid currency code"),
  description: safeStr(undefined, 1000).optional(),
  location: safeStr(undefined, 200).optional(),
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const transactionSchema = z.object({
  amount: z.number().positive().max(1e10), // Max $10 billion
  currency: z.string().length(3).regex(/^[A-Z]{3}$/),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "PAYMENT"]),
  description: safeStr(undefined, 500),
  recipientId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

// Investment opportunity schema
export const investmentOpportunitySchema = z.object({
  title: safeStr(1, 200),
  description: safeStr(1, 5000),
  minimumInvestment: z.number().positive().max(1e9),
  maximumInvestment: z.number().positive().max(1e10),
  expectedReturn: z.number().min(0).max(1000), // Percentage
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  sector: safeStr(undefined, 50),
  region: safeStr(undefined, 100),
  duration: z.number().positive().max(600), // Months
  documents: z.array(z.object({
    name: safeStr(undefined, 200),
    url: z.string().url(),
    type: z.enum(["PROSPECTUS", "FINANCIAL_STATEMENT", "LEGAL_DOCUMENT", "OTHER"])
  })).max(20).optional()
});

// Event schema for social hub
export const eventSchema = z.object({
  title: safeStr(1, 200),
  description: safeStr(undefined, 2000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.object({
    name: safeStr(undefined, 200),
    address: safeStr(undefined, 500),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional()
  }),
  maxAttendees: z.number().positive().max(10000),
  price: z.number().min(0).max(1e6),
  category: z.enum(["NETWORKING", "CONFERENCE", "GALA", "PRIVATE", "CHARITY", "INVESTMENT"])
});

// Search and filter schemas
export const searchSchema = z.object({
  query: safeStr(undefined, 200),
  filters: z.object({
    category: z.array(z.string()).max(10).optional(),
    minValue: z.number().min(0).optional(),
    maxValue: z.number().max(1e12).optional(),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime()
    }).optional(),
    location: safeStr(undefined, 100).optional(),
    tags: z.array(safeStr(undefined, 50)).max(20).optional()
  }).optional(),
  sort: z.object({
    field: z.string().max(50),
    order: z.enum(["asc", "desc"])
  }).optional(),
  pagination: z.object({
    page: z.number().positive().max(10000),
    limit: z.number().positive().max(100)
  }).optional()
});

// API request validation
export const apiRequestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  endpoint: z.string().max(500),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  timestamp: z.number(),
  requestId: z.string().uuid()
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: safeStr(undefined, 255),
  mimetype: z.string().refine(
    (type) => {
      const allowedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
      ];
      return allowedTypes.includes(type);
    },
    { message: "File type not allowed" }
  ),
  size: z.number().positive().max(50 * 1024 * 1024), // Max 50MB
  checksum: z.string().optional()
});

// Validation helper functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
    throw error;
  }
}

export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`)
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

// Sanitization utilities
export const sanitizers = {
  html: (input: string): string => {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  sql: (input: string): string => {
    return input
      .replace(/'/g, "''")
      .replace(/"/g, '""')
      .replace(/;/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");
  },

  filename: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, "_")
      .substring(0, 255);
  },

  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
      return url.toString();
    } catch {
      throw new Error("Invalid URL");
    }
  }
};

// ──────────────────────────────────────────────
// Route-specific schemas (used by withValidation)
// ──────────────────────────────────────────────

/** Block common NoSQL injection operators */
const noSQLInjectionCheck = (val: string) =>
  !/\$(?:gt|gte|lt|lte|ne|in|nin|and|or|not|regex|where|exists|type|expr|jsonSchema|mod|text|all|elemMatch|size|slice|meta)|__proto__|constructor\[/i.test(val);

/** Block script injection */
const noXSSCheck = (val: string) =>
  !/<\s*script[\s>]/i.test(val) && !/javascript\s*:/i.test(val) && !/on\w+\s*=/i.test(val);

/** Bounded + injection-safe string */
function routeSafeString(maxLen: number = 1000) {
  return z
    .string()
    .max(maxLen)
    .refine(noSQLInjectionCheck, { message: 'Input contains disallowed characters' })
    .refine(noXSSCheck, { message: 'Input contains disallowed content' });
}

function routeSafeOptionalString(maxLen: number = 1000) {
  return routeSafeString(maxLen).optional();
}

// Payment
export const paymentCreateOrderSchema = z.object({
  tier: routeSafeString(50),
  session_id: routeSafeString(100),
  user_email: routeSafeOptionalString(254),
});

export const paymentVerifySchema = z.object({
  payment_id: routeSafeString(100),
  order_id: routeSafeString(100),
  signature: routeSafeString(500),
  tier: routeSafeString(50),
  session_id: routeSafeString(100),
  user_email: routeSafeOptionalString(254),
});

export const refundNotificationSchema = z.object({
  user_email: z.string().email().max(254),
  refund_amount: z.number().positive(),
  currency: routeSafeString(10),
  payment_id: routeSafeString(100),
  refund_id: routeSafeOptionalString(100),
  reason: routeSafeOptionalString(500),
});

// Assessment
export const assessmentInquirySchema = z.object({
  session_id: routeSafeString(100),
  email: z.string().email().max(254),
  whatsapp: routeSafeOptionalString(20),
  tier: routeSafeString(50),
});

// Decision Memo
export const decisionMemoStartSchema = z.object({
  user_id: routeSafeString(100),
  email: z.string().email().max(254),
});

export const decisionMemoAnswerSchema = z.object({
  intake_id: routeSafeString(100),
  question_id: routeSafeString(100),
  answer: routeSafeString(5000),
});

export const sfoIntakeSchema = z.object({
  thesis: z.object({
    move_description: routeSafeString(5000),
    expected_outcome: routeSafeString(5000),
  }),
  constraints: routeSafeOptionalString(5000),
  control_and_rails: routeSafeOptionalString(5000),
  urgency: routeSafeOptionalString(200),
  user_id: routeSafeOptionalString(100),
  email: routeSafeOptionalString(254),
});

export const decisionMemo10qSchema = z.object({
  user_id: routeSafeString(100),
  responses: z.array(
    z.object({
      question_id: routeSafeString(100),
      answer: routeSafeString(5000),
    })
  ).max(50),
});

// GDPR
export const gdprRequestSchema = z.object({
  type: z.enum(['ACCESS', 'PORTABILITY', 'ERASURE', 'RECTIFICATION', 'RESTRICTION']),
  user_id: routeSafeString(100),
});

// Concierge
export const conciergeSchema = z.object({
  source: z.enum(['social_hub', 'prive_exchange', 'calendar']),
  _subject: routeSafeOptionalString(500),
  message: routeSafeOptionalString(5000),
  _gotcha: z.string().max(0).optional(),
}).passthrough();

// Generic safe-body check for pass-through routes
const safeBodyValue: z.ZodType<unknown> = z.union([
  routeSafeString(10000),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.lazy(() => safeBodyValue)),
  z.record(z.string(), z.lazy(() => safeBodyValue)),
]);

export const safeBodySchema = z.record(z.string(), safeBodyValue);

// Request validation function
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export function validateRequest(endpoint: string, data: any): ValidationResult {
  try {
    switch (endpoint) {
      case 'developments':
        // Validate developments request
        const developmentsSchema = z.object({
          start_date: z.string().optional(),
          end_date: z.string().optional(),
          industry: z.string().optional(),
          product: z.string().optional(),
          page: z.number().min(1).optional(),
          page_size: z.number().min(1).max(100).optional(),
          sort_by: z.string().optional(),
          sort_order: z.enum(['asc', 'desc']).optional(),
          time_range: z.string().optional()
        });
        developmentsSchema.parse(data);
        return { isValid: true };

      case 'opportunities':
        // Validate opportunities request
        const opportunitiesSchema = z.object({
          region: z.string().optional(),
          industry: z.string().optional(),
          riskLevel: z.string().optional(),
          page: z.number().min(1).optional(),
          page_size: z.number().min(1).max(100).optional()
        });
        opportunitiesSchema.parse(data);
        return { isValid: true };

      default:
        // Generic validation for unknown endpoints
        const genericSchema = z.object({}).passthrough();
        genericSchema.parse(data);
        return { isValid: true };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`)
      };
    }
    return { isValid: false, errors: ["Validation failed"] };
  }
}