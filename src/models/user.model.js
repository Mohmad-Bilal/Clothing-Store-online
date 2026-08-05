const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    required: [true, "country is required"],
  },
  city: {
    type: String,
  },
  street: {
    type: String,
  },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name must be at most 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name must be at most 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    unique: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  phone: {
    type: String,
  },
  addresses: [addressSchema],
  avatar: {
    fileId: {
      type: String,
    },
    url: {
      type: String,
    },
  },

  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
  },
  timestamps: true,
  versionKey: false,
});

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
