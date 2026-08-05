const Joi = require("joi");
const password = require("./common/password");
const email = require("./common/email");

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "First name must be a string",
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name must not exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Last name must be a string",
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name must not exceed 50 characters",
    "any.required": "Last name is required",
  }),
  email: email.required(),
  password: password.required(),
  confirmNewPassword: password.required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must match the password",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().lowercase().messages({
    "string.base": "Last name must be a string",
    "string.empty": "Last name is required",
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),
  password: password.required(),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().lowercase().messages({
    "string.base": "Last name must be a string",
    "string.empty": "Last name is required",
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),
});

const changePasswordSchema = Joi.object({
  oldPassword: password.required(),
  newPassword: password.required(),
  confirmNewPassword: password
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "any.only": "Confirm password must match the new password",
    }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.base": "   must be a string",
    "string.empty": " is required",
    "any.required": " is required",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
};
