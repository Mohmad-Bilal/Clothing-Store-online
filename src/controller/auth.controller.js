const User = require("../models/user.model");
const OTP = require("../models/otp.model");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const config = require("../config/env");
const generateTokens = require("../utils/generateTokens");
const { generateOTP } = require("../utils/OTP");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

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

  const otp = generateOTP();

  const codeHashed = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let otpDoc;
  try {
    otpDoc = await OTP.create({
      user: newUser._id,
      codeHashed,
      expiresAt,
      purpose: "email-verification",
    });

    await sendEmail({
      to: newUser.email,
      subject: "verify your account with OTP",
      html: `<h2> this is the OTP: ${otp} </h2> <p> this verification code will expires in 10 minutes></p>`,
    });
  } catch (err) {
    if (otpDoc) {
      await OTP.findByIdAndDelete(otpDoc._id);
    }
    throw new ApiError(500, "Failed to create OTP");
  }
  return ApiResponse(res, 201, "user registered successfully", {
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    },
  });
});

const otpVerification = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user are not found");
  }
  const id = user._id;

  const existingOtp = await OTP.findOne({
    user: id,
    purpose: "email-verification",
  });

  if (!existingOtp) {
    throw new ApiError(401, "OTP did not found");
  }

  if (existingOtp.attempts >= 5) {
    throw new ApiError(429, "to many attempts");
  }

  if (existingOtp.expiresAt < new Date()) {
    throw new ApiError(401, "OTP is Expired");
  }

  const isValid = await bcrypt.compare(otp, existingOtp.codeHashed);

  if (!isValid) {
    existingOtp.attempts += 1;
    await existingOtp.save();
    throw new ApiError(401, "this code are not valid plz try a valid code");
  }
  user.isVerified = true;
  await user.save();

  await OTP.deleteOne({ _id: existingOtp._id });

  return ApiResponse(res, 201, " your account is verified", {
    user: {
      fullName: `${user.firstName} ${user.lastName}`,
    },
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const coolDown = 60 * 1000;
  const now = Date.now();
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (user.isVerified) {
    throw new ApiError(403, "user is already verified");
  }
  const timeOtp = await OTP.findOne({
    user: user._id,
    purpose: "email-verification",
  });

  if (timeOtp && timeOtp.createdAt) {
    const timePassed = now - new Date(timeOtp.createdAt).getTime();
    if (timePassed < coolDown) {
      const secondRemaining = Math.ceil((coolDown - timePassed) / 1000);
      return ApiResponse(
        res,
        429,
        `you should wait ${secondRemaining} before you send another otp`,
      );
    }
  }

  await OTP.findOneAndDelete({
    user: user._id,
    purpose: "email-verification",
  });

  const otp = generateOTP();

  const codeHashed = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let otpDoc;
  try {
    otpDoc = await OTP.create({
      user: user._id,
      codeHashed,
      expiresAt,
      purpose: "email-verification",
    });
    await sendEmail({
      to: user.email,
      subject: "verify your account with OTP",
      html: `<h2> this is the OTP: ${otp} </h2> <p> this verification code will expires in 10 minutes></p>`,
    });
  } catch (err) {
    if (otpDoc) {
      await OTP.findByIdAndDelete(otpDoc._id);
    }
    throw new ApiError(401, "failed to resend the otp");
  }

  return ApiResponse(res, 200, "otp resend to your email");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }
  // VERIFIED USER FOR OTP WILL BE HERE
  if (!user.isVerified) {
    throw new ApiError(
      403,
      "you need to verify your account before you log in ",
    );
  }
  // VERIFIED USER FOR OTP WILL BE HERE

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

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "the user does not found");
  }

  const otp = generateOTP();

  const codeHashed = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let otpDoc;

  try {
    otpDoc = await OTP.create({
      user: user._id,
      codeHashed,
      expiresAt,
      purpose: "password-reset",
    });

    await sendEmail({
      to: email,
      subject: "password changing code",
      html: ``,
    });
  } catch (err) {
    if (otpDoc) {
      await OTP.findByIdAndDelete(otpDoc._id);
    }
    throw new ApiError(401, "otp did not sent there is a problem");
  }

  return ApiResponse(res, 200, "otp sent to your email", {
    user: {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
    },
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "user didn't found");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "you didn't verify your account yet");
  }

  const existingOtp = await OTP.findOne({
    user: user._id,
    purpose: "password-reset",
  });

  if (!existingOtp) {
    throw new ApiError(400, "invalid or expired otp");
  }
  if (existingOtp.expiresAt < new Date()) {
    throw new ApiError(401, "OTP is Expired");
  }
  if (existingOtp.attempts >= 5) {
    existingOtp.attempts += 1;
    await existingOtp.save();
    throw new ApiError(429, "to many attempts");
  }
  const isMatch = await bcrypt.compare(otp, existingOtp.codeHashed);
  if (!isMatch) {
    throw new ApiError(401, "otp is incorrect");
  }

  user.password = newPassword;

  await user.save();

  await OTP.findByIdAndDelete({ _id: existingOtp._id });

  return ApiResponse(res, 200, "password have changed ");
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

module.exports = {
  register,
  login,
  profile,
  logout,
  refreshToken,
  otpVerification,
  resendOtp,
  resetPassword,
  forgotPassword,
};
