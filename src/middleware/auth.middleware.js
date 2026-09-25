const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }
  let token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded || !decoded.userId) {
      throw new ApiError(401, "The user not found");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }

    throw new ApiError(401, "Invalid Token");
  }
});

const allowTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed to access this route");
    }
    next();
  };
};

module.exports = { protect, allowTo };
