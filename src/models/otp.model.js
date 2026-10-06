const { required } = require("joi");
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Email is required"],
    },
    codeHashed: {
      type: String,
      required: [true, "OTP has no hashed code"],
    },
    expiresAt: {
      type: Date,
      required: [true, "OTP has no expires Date"],
    },
    purpose: {
      type: String,
      enum: ["email-verification", "password-reset", "phone-verification"],
      required: [true, "Purpose is required"],
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
