const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
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
    default: "doctor",
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  specialty:   { type: String },
  experience:  { type: Number },
  certificate: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);