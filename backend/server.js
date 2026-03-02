require("dotenv").config();

const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const bcrypt     = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto     = require("crypto");

const app = express();

// ── Middleware ──
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ── MongoDB connection ──
const connectDB = require("./config/db");
connectDB();

// ── User Model ──
const userSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },
});

const User = mongoose.model("User", userSchema);

// ── Nodemailer ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────
// POST /register
// ─────────────────────────────────────────────
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// POST /login
// ─────────────────────────────────────────────
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailNormalized = email.trim().toLowerCase();
    const user            = await User.findOne({ email: emailNormalized });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
});

// ─────────────────────────────────────────────
// POST /forgot-password
// ─────────────────────────────────────────────
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetToken       = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from:    `"Your App" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0c2a4a;">Reset your password</h2>
          <p style="color: #555;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetURL}"
             style="display:inline-block; margin-top:16px; padding:12px 28px;
                    background:#0ea5e9; color:#fff; text-decoration:none;
                    border-radius:8px; font-weight:500;">
            Reset Password
          </a>
          <p style="margin-top:24px; font-size:12px; color:#999;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────
// POST /reset-password/:token
// ─────────────────────────────────────────────
app.post("/reset-password/:token", async (req, res) => {
  const { token }    = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password is required." });
  }

  try {
    const user = await User.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    const hashed          = await bcrypt.hash(password, 12);
    user.password         = hashed;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── Start server ──
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});