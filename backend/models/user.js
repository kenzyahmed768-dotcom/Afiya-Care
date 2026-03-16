const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:             { type: String },
  age:              { type: Number },
  email:            { type: String },
  password:         { type: String },
  photo:            { type: String },
  bio:              { type: String },
  phone:            { type: String },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },

  role: {
    type: String,
    default: "patient",
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);