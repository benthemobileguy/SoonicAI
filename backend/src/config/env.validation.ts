import * as Joi from 'joi';

/**
 * Environment variable validation schema
 *
 * Validates all required environment variables at startup.
 * If any required variable is missing or invalid, the application will fail to start.
 *
 * Based on NestJS best practices:
 * https://dev.to/amirfakour/robust-environment-variable-validation-in-nestjs-applications-4om9
 */
export const validationSchema = Joi.object({
  // ==========================================
  // APPLICATION
  // ==========================================
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .default(3001),

  // ==========================================
  // FRONTEND
  // ==========================================
  FRONTEND_URL: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'FRONTEND_URL is required for CORS configuration',
      'string.uri': 'FRONTEND_URL must be a valid URL',
    }),

  // ==========================================
  // SUPABASE (Required)
  // ==========================================
  SUPABASE_URL: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'SUPABASE_URL is required. Get it from your Supabase project settings.',
      'string.uri': 'SUPABASE_URL must be a valid URL',
    }),

  SUPABASE_ANON_KEY: Joi.string()
    .optional()
    .description('Public anon key (not used by backend, but kept for consistency)'),

  SUPABASE_SERVICE_KEY: Joi.string()
    .required()
    .messages({
      'any.required': 'SUPABASE_SERVICE_KEY is required. Get it from Supabase project settings.',
    }),

  // ==========================================
  // STRIPE (Required for payments)
  // ==========================================
  STRIPE_SECRET_KEY: Joi.string()
    .required()
    .pattern(/^sk_(test|live)_/)
    .messages({
      'any.required': 'STRIPE_SECRET_KEY is required for payment processing',
      'string.pattern.base': 'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_',
    }),

  STRIPE_WEBHOOK_SECRET: Joi.string()
    .optional()  // Optional for development (can use Stripe CLI)
    .pattern(/^whsec_/)
    .messages({
      'string.pattern.base': 'STRIPE_WEBHOOK_SECRET must start with whsec_',
    }),

  STRIPE_PRICE_SUBSCRIPTION: Joi.string()
    .required()
    .pattern(/^price_/)
    .messages({
      'any.required': 'STRIPE_PRICE_SUBSCRIPTION is required. Create products in Stripe dashboard.',
      'string.pattern.base': 'STRIPE_PRICE_SUBSCRIPTION must be a valid Stripe price ID',
    }),

  STRIPE_PRICE_STARTER: Joi.string()
    .required()
    .pattern(/^price_/)
    .messages({
      'any.required': 'STRIPE_PRICE_STARTER is required',
      'string.pattern.base': 'STRIPE_PRICE_STARTER must be a valid Stripe price ID',
    }),

  STRIPE_PRICE_STANDARD: Joi.string()
    .required()
    .pattern(/^price_/)
    .messages({
      'any.required': 'STRIPE_PRICE_STANDARD is required',
      'string.pattern.base': 'STRIPE_PRICE_STANDARD must be a valid Stripe price ID',
    }),

  STRIPE_PRICE_PRO_PACK: Joi.string()
    .required()
    .pattern(/^price_/)
    .messages({
      'any.required': 'STRIPE_PRICE_PRO_PACK is required',
      'string.pattern.base': 'STRIPE_PRICE_PRO_PACK must be a valid Stripe price ID',
    }),

  // ==========================================
  // AI SERVICE (Required)
  // ==========================================
  AI_SERVICE_URL: Joi.string()
    .uri()
    .default('http://localhost:8000')
    .messages({
      'string.uri': 'AI_SERVICE_URL must be a valid URL',
    }),

  // ==========================================
  // PROCESSING
  // ==========================================
  MAX_VIDEO_DURATION: Joi.number()
    .integer()
    .min(30)
    .max(600)  // 10 minutes max
    .default(300),

  TEMP_DIR: Joi.string()
    .default('/tmp'),
});
