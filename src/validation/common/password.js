const Joi = require("joi");
const password = Joi.string()
  .min(6)
  .max(50)
  .pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
  )
  .messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 50 characters",
    "any.required": "Email is required",
  });

module.exports = password;
