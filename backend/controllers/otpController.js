const otpGenerator = require("otp-generator");
const db = require("../config/db");
const transporter = require("../services/emailService");

// Promisify db.query for async/await
const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

/* ── SEND OTP ──────────────────────────────────────────────────────────────── */
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Verify user exists
    const users = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "No account found with that email" });
    }

    // Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove old OTPs for this email
    await query("DELETE FROM otps WHERE email = ?", [email]);

    // Insert new OTP
    await query(
      "INSERT INTO otps (email, otp_code, expires_at, verified) VALUES (?, ?, ?, 0)",
      [email, otp, expiresAt]
    );

    // Send email
    const info = await transporter.sendMail({
      from: `"CareConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your CareConnect OTP Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:40px 32px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#6d28d9;font-size:24px;margin:0;">CareConnect</h1>
            <p style="color:#6b7280;margin:8px 0 0;">Email Verification</p>
          </div>
          <p style="color:#374151;font-size:15px;line-height:1.6;">
            Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f5f3ff;border:2px solid #7c3aed;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
            <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#4c1d95;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✅ OTP email sent to ${email} — MessageId: ${info.messageId}`);
    return res.json({ message: "OTP sent successfully. Check your inbox." });
  } catch (err) {
    console.error("❌ sendOTP error:", err.message);
    console.log(`\n📧 [FALLBACK OTP] ${email} → Check DB or fix email config\n`);

    return res.status(500).json({
      message: "Failed to send OTP email. Check server configuration.",
      detail: err.message,
    });
  }
};

/* ── VERIFY OTP ────────────────────────────────────────────────────────────── */
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const records = await query(
      `SELECT * FROM otps
       WHERE email = ? AND otp_code = ? AND expires_at > NOW() AND verified = 0
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, String(otp)]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    const record = records[0];

    await query("UPDATE otps SET verified = 1 WHERE id = ?", [record.id]);

    console.log(`✅ OTP verified for ${email}`);
    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ verifyOTP error:", err.message);
    return res.status(500).json({
      message: "Verification failed. Try again.",
      detail: err.message,
    });
  }
};