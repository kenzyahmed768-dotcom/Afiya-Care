const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ------------------
// Connect to MongoDB
// ------------------
const connectDB = require("./config/db");

connectDB().then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"));
});
// ------------------
// User Model
// ------------------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ------------------
// Register Route
// ------------------
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// ------------------
// Login Route
// ------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Normalize email
    const emailNormalized = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Login success, return message (can add token later)
    res.json({ message: "Login successful!" });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
});
// ------------------
// Start server
// ------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));