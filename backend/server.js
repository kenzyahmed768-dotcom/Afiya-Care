require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const bcrypt = require("bcryptjs");

async function hashPassword() {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash("123456", salt); // your desired password
  console.log(hashed);
}

hashPassword();
const nodemailer = require("nodemailer");
const crypto     = require("crypto");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// -----------------
// User model
// -----------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor", "admin"], required: true },
  status: { type: String, enum: ["pending", "approved"], default: "approved" },
  specialty: String,
  experience: Number,
  certificate: String,
  resetToken: String,
  resetTokenExpiry: Date,
});

const User = mongoose.model("User", userSchema);

// -----------------
// Nodemailer setup
// -----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -----------------
// Register route
// -----------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, specialty, experience } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set status pending for doctors
    const status = role === "doctor" ? "pending" : "approved";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      specialty: role === "doctor" ? specialty : undefined,
      experience: role === "doctor" ? experience : undefined,
      status
    });

    await newUser.save();
    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------
// Login route
// -----------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Block pending doctors
    if (user.role === "doctor" && user.status === "pending") {
      return res.json({ message: "Waiting for admin approval" });
    }

    res.json({ message: "Login successful", role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------
// Forgot password
// -----------------
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });

    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 60;

    user.resetToken       = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click here to reset your password: <a href="${resetURL}">${resetURL}</a></p>`,
    });

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -----------------
// Reset password
// -----------------
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "New password required" });

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Reset link invalid or expired" });

    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -----------------
// Start server
// -----------------
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});