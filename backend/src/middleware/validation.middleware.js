import { validate } from '../utils/validators.js';

/**
 * Middleware to validate request data against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Source of data ('body', 'query', 'params')
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const result = validate(schema, data);

    if (result.error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error,
      });
    }

    // Replace request data with validated and sanitized data
    req[source] = result.value;
    next();
  };
};

export default {
  validateRequest,
};




