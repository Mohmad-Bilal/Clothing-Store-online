const User = require("../models/user.model");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const config = require("../config/env");
const generateTokens = require("../utils/generateTokens");

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const existingUser = await User.findOne({ email }).select("+password");
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  return ApiResponse(res, 201, "user registered successfully", {
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // VERIFIED USER FOR OTP WILL BE HERE
  const isVerified = user.isVerified;
  // VERIFIED USER FOR OTP WILL BE HERE

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return ApiResponse(res, 200, "user logged in successfully", {
    user: {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
    },
    email: user.email,
    accessToken,
    refreshToken,
  });
});

const profile = asyncHandler(async (req, res) => {
  const user = req.user;

  return ApiResponse(res, 200, "user profile fetched successfully", {
    user: {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.refreshToken = null;
  await user.save();

  return ApiResponse(res, 200, "user logged out successfully");
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new ApiError(401, "user not found");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (decoded.userId !== user._id.toString()) {
    throw new ApiError(401, "you are not authorized");
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id,
  );

  user.refreshToken = newRefreshToken;

  await user.save();

  return ApiResponse(res, 200, "Token refreshed successfully", {
    accessToken,
    refreshToken: newRefreshToken,
  });
});

const emailVerification = asyncHandler(async (req, res) => {});

module.exports = { register, login, profile, logout, refreshToken };
