require("dotenv").config();
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const Admin = require("./models/admin");
const User = require("./models/user");

async function seedAdmin() {
  try {
    await connectDB();

    const email = "admin@afiya.com";
    const password = "123456";

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.deleteOne({ email });

    await Admin.findOneAndUpdate(
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

    console.log("✅ Admin seeded successfully in Admin collection");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seedAdmin();