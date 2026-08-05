const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const { registerSchema } = require("../validation/auth.validator");
const { register } = require("../controller/auth.controller");

router.post("/register", validate(registerSchema), register);

module.exports = router;
