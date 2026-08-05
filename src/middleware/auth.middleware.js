// const jwt = require("jsonwebtoken");
// const config = require("../config/env");
// const User = require("../models/user.model");
// const ApiError = require("../utils/ApiError");
// const asyncHandler = require("express-async-handler");
// const ApiResponse = require("../utils/ApiResponse");

// const protect = asyncHandler(async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   let token;

//   if (req.cookies?.token) {
//     token = req.cookies.token;
//   }
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new ApiError(401, "Not authorized, no token");
//   }

//   if (!token && authHeader && authHeader.startsWith("Bearer ")) {
//     token = authHeader.split(" ")[1];
//   }
//   if (!token) {
//     throw new ApiError(401, "Not authorized, no token");
//   }
//   let decoded;
//   try {
//     decoded = jwt.verify(token, config.jwtSecret);
//   } catch (err) {
//     throw new ApiError(401, "Not authorized, token failed");
//   }
//   const user = await User.findById(decoded.id);

//   if (!user) {
//     throw new ApiError(401, "Not authorized, user not found");
//   }

//   req.user = user;
//   next();
// });

// const allowTo = (...roles) => {};

// module.exports = { protect, allowTo };
