const ApiError = require("../utils/apiError");

const validate =
  (schema,
  (property = "body") => {
    return (req, res, next) => {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });
      if (error) {
        return next(
          new ApiError(
            400,
            "Validation Error",
            error.details.map((err) => err.message),
          ),
        );
      }
      req[property] = value;
      next();
    };
  });

module.exports = validate;
