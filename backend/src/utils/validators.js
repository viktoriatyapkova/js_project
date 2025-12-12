import Joi from 'joi';

// Email validation schema
const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Invalid email format',
  'any.required': 'Email is required',
});

// Password validation schema (min 6 characters)
const passwordSchema = Joi.string().min(6).required().messages({
  'string.min': 'Password must be at least 6 characters long',
  'any.required': 'Password is required',
});

// Username validation schema
const usernameSchema = Joi.string().min(3).max(50).required().messages({
  'string.min': 'Username must be at least 3 characters long',
  'string.max': 'Username must be at most 50 characters long',
  'any.required': 'Username is required',
});

// Video URL validation (YouTube or Vimeo)
const videoUrlSchema = Joi.string().uri().pattern(
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/
).allow('').max(500).messages({
  'string.pattern.base': 'Video URL must be from YouTube or Vimeo',
  'string.max': 'Video URL must be at most 500 characters long',
});

// Difficulty level enum
const difficultyLevelSchema = Joi.string().valid('beginner', 'intermediate', 'advanced').messages({
  'any.only': 'Difficulty level must be one of: beginner, intermediate, advanced',
});

// Registration validation schema
export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

// Login validation schema
export const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

// Move creation/update validation schema
export const moveSchema = Joi.object({
  name: Joi.string().max(200).required().messages({
    'string.max': 'Move name must be at most 200 characters long',
    'any.required': 'Move name is required',
  }),
  description: Joi.string().allow('').optional(),
  video_url: videoUrlSchema,
  difficulty_level: difficultyLevelSchema.optional(),
});

// Routine creation/update validation schema
export const routineSchema = Joi.object({
  name: Joi.string().max(200).required().messages({
    'string.max': 'Routine name must be at most 200 characters long',
    'any.required': 'Routine name is required',
  }),
  description: Joi.string().allow('').optional(),
  duration_minutes: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be an integer',
    'number.min': 'Duration must be a positive number',
  }),
});

// Routine move validation schema
export const routineMoveSchema = Joi.object({
  move_id: Joi.number().integer().required().messages({
    'number.base': 'Move ID must be a number',
    'any.required': 'Move ID is required',
  }),
  order: Joi.number().integer().min(0).required().messages({
    'number.base': 'Order must be a number',
    'number.integer': 'Order must be an integer',
    'number.min': 'Order must be a positive number',
    'any.required': 'Order is required',
  }),
});

/**
 * Validate data against schema
 * @param {Object} schema - Joi schema
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return { error: errors, value: null };
  }
  return { error: null, value };
};



