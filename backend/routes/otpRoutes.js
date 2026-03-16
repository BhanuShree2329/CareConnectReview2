const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP } = require("../controllers/otpController");

// Frontend calls: POST /api/otp/send  and  POST /api/otp/verify
router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);

// Also keep old paths as aliases in case anything references them
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;
