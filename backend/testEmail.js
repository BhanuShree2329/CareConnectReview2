/**
 * Run this to test if your email credentials work:
 *   node backend/testEmail.js
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

async function test() {
  console.log("Testing email with:");
  console.log("  USER:", process.env.EMAIL_USER);
  console.log("  PASS:", process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.slice(0,4)}****` : "NOT SET");

  try {
    await transporter.verify();
    console.log("\n✅ SMTP connection OK!\n");

    const info = await transporter.sendMail({
      from: `"CareConnect Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to self
      subject: "CareConnect Email Test",
      text: "If you receive this, your email config is working correctly!",
    });

    console.log("✅ Test email sent! MessageId:", info.messageId);
    console.log("   Check inbox of:", process.env.EMAIL_USER);
  } catch (err) {
    console.error("\n❌ Email test FAILED:", err.message);
    console.log("\n── Common fixes ──────────────────────────────────────");
    console.log("1. Make sure 2-Step Verification is ON for your Google account");
    console.log("2. Go to: myaccount.google.com → Security → App passwords");
    console.log("3. Create an App Password for 'Mail'");
    console.log("4. Paste the 16-char code (no spaces) into .env as EMAIL_PASS");
    console.log("──────────────────────────────────────────────────────\n");
  }
}

test();
