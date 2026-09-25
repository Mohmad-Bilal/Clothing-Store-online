const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const { registerSchema, loginSchema } = require("../validation/auth.validator");
const {
  register,
  login,
  profile,
  refreshToken,
  logout,
} = require("../controller/auth.controller");

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/logout", protect, logout);

router.post("/refresh-token", refreshToken);

router.get("/profile", protect, profile);

module.exports = router;
