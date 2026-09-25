const jwt = require("jsonwebtoken");
const config = require("../config/env");
const ApiError = require("./ApiError");

const generateTokens = (userId) => {
  try {
    const accessToken = jwt.sign(
      { userId: userId.toString() },
      config.jwtSecret,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      { userId: userId.toString() },
      config.jwtRefreshSecret,
      {
        expiresIn: "7d",
      },
    );
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

module.exports = generateTokens;
