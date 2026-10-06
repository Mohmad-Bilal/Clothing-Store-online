require("dotenv").config();

if (!process.env.MONGODB_URI) {
  console.error("Error: MONGODB_URI is missing");
  process.exit(1);
}

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  mongodbUri: process.env.MONGODB_URI,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  imagekitApiKey: process.env.IMAGEKIT_API_KEY,
  imagekitApiSecret: process.env.IMAGEKIT_API_SECRET,
  imagekitUriEndpoint: process.env.IMAGEKIT_URI_ENDPOINT,
};

module.exports = config;
