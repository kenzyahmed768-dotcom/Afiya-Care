const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name:             { type: String },
  age:              { type: Number },
  email:            { type: String },
  password:         { type: String },
  photo:            { type: String },
  phone:            { type: String },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },

  role: {
    type: String,
    default: "admin",
  },

  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "approved",
  },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);