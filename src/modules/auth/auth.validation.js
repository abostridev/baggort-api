const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'any.required': 'Le nom est obligatoire',
  }),
  phone: Joi.string()
    .pattern(/^\+228[0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Numéro invalide. Format attendu : +22890123456',
      'any.required': 'Le numéro est obligatoire',
    }),
  role: Joi.string().valid('client', 'driver').required().messages({
    'any.only': 'Le rôle doit être client ou driver',
    'any.required': 'Le rôle est obligatoire',
  }),
});

const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+228[0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Numéro invalide. Format attendu : +22890123456',
      'any.required': 'Le numéro est obligatoire',
    }),
});

const verifyOTPSchema = Joi.object({
  phone: Joi.string().pattern(/^\+228[0-9]{8}$/).required(),
  code: Joi.string().length(4).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Le code doit contenir 4 chiffres',
    'string.pattern.base': 'Le code doit être numérique',
    'any.required': 'Le code est obligatoire',
  }),
});

module.exports = { registerSchema, loginSchema, verifyOTPSchema };