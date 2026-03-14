// seedAdmin.js — run ONCE with: node seedAdmin.js, then delete it
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/user");

async function seedAdmin() {
  await connectDB();

  const email = "admin@afiya.com";   // ← change this
  const password = "123456"; // ← change this

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      status: "approved",
    },
    { upsert: true, new: true }
  );

  console.log("✅ Admin seeded successfully");
  process.exit();
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});