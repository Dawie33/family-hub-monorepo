import * as Joi from 'joi'

export const envValidationSchema = Joi.object({
  // Database - either DATABASE_URL (production) or individual fields (development)
  DATABASE_URL: Joi.string().optional(),
  DATABASE_HOST: Joi.string().optional(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().optional(),
  DATABASE_PASSWORD: Joi.string().optional(),
  DATABASE_NAME: Joi.string().optional(),

  // OpenAI
  OPENAI_API_KEY: Joi.string().required(),

  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // JWT
  JWT_SECRET: Joi.string().required(),

  // Google Calendar
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_REDIRECT_URI: Joi.string().optional(),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),

  // Strava
  STRAVA_CLIENT_ID: Joi.string().allow('').optional(),
  STRAVA_CLIENT_SECRET: Joi.string().allow('').optional(),
  STRAVA_REDIRECT_URI: Joi.string().allow('').optional(),
}).or('DATABASE_URL', 'DATABASE_HOST') // Au moins l'un des deux doit être présent