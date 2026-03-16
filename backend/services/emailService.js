const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail SMTP — EMAIL_PASS must be a Gmail App Password (16 chars, no spaces)
// Generate: myaccount.google.com → Security → 2-Step Verification → App passwords
// If not configured, OTPs are printed to the server console as a fallback.

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,        // STARTTLS — more firewall-friendly than 465
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify connection on startup
transporter.verify((err) => {
  if (err) {
    console.warn("⚠️  Email service not connected:", err.message);
    console.warn("   OTPs will be printed to console as fallback.");
    console.warn("   Fix: Set a valid Gmail App Password in backend/.env → EMAIL_PASS");
  } else {
    console.log("✅ Email service connected:", process.env.EMAIL_USER);
  }
});

module.exports = transporter;
