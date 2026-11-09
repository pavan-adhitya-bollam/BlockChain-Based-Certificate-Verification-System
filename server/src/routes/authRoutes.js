const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
