const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://AfiyaCare:AfiyaCareBis@afiyacare.up4plwx.mongodb.net/afiyaCare"); // just the URI
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;