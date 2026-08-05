const email = Joi.string().trim().email().lowercase().messages({
  "string.base": "Last name must be a string",
  "string.empty": "Last name is required",
  "string.email": "Email must be a valid email",
  "any.required": "Email is required",
});

module.exports = email;
