const User = require("../models/user.model");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const config = require("../config/env");

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
  });
  // const token = jwt.sign({ id: newUser._id }, config.jwtSecret, {
  //   expiresIn: "15m",
  // });
  // const refreshToken = jwt.sign({ id: newUser._id }, config.jwtRefreshSecret, {
  //   expiresIn: "7d",
  // });

  return ApiResponse(res, 201, "user registered successfully", {
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    },
    token,
    refreshToken,
  });
});

module.exports = { register };
