const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { createUser, findUserByEmail, findUserById } = require("../models/userModel");
const { createNGOProfile } = require("../models/ngoProfileModel");
const db = require("../config/db");
const transporter = require("../services/emailService");

const SECRET = process.env.JWT_SECRET || "careconnect_secret_key";

// Promisify db.query
const query = (sql, params) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// Shared: generate + store + email OTP
async function dispatchOTP(email) {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await query("DELETE FROM otps WHERE email = ?", [email]);

  await query(
    "INSERT INTO otps (email, otp_code, expires_at, verified) VALUES (?, ?, ?, 0)",
    [email, otp, expiresAt]
  );

  await transporter.sendMail({
    from: `"CareConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your CareConnect OTP Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:40px 32px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#6d28d9;font-size:24px;margin:0;">CareConnect</h1>
          <p style="color:#6b7280;margin:8px 0 0;">Verification Code</p>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Use the code below to verify your account. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#f5f3ff;border:2px solid #7c3aed;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#4c1d95;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px;text-align:center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  console.log(`✅ OTP dispatched to ${email}`);
  return otp;
}

/* ── REGISTER ──────────────────────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization, registrationNo, focusArea, website, phone, address } = req.body;

    const validRoles = ["elder", "caretaker", "ngo", "admin", "orphan"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Allowed: ${validRoles.join(", ")}` });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "An account with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await createUser(name, email, hashedPassword, role);
    const newUserId = result.insertId;

    if (role === "ngo" && organization) {
      await createNGOProfile({ userId: newUserId, organization, registrationNo, focusArea, website, phone, address });
    }

    // Send OTP — fire and don't block response on failure
    try {
      await dispatchOTP(email);
    } catch (mailErr) {
      console.error("❌ Registration OTP email failed:", mailErr.message);
      console.log(`\n📧 [FALLBACK] OTP not emailed for ${email} — check email config\n`);
    }

    res.status(201).json({
      message: "Registered successfully! Check your email for the OTP verification code.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ── LOGIN ─────────────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your account has been rejected by admin." });
    }
    if (user.status !== "approved") {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Send OTP — non-blocking
    try {
      await dispatchOTP(email);
    } catch (mailErr) {
      console.error("❌ Login OTP email failed:", mailErr.message);
      console.log(`\n📧 [FALLBACK] Login OTP not emailed for ${email} — check email config\n`);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ── GET ME ────────────────────────────────────────────────────────────────── */
exports.getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
