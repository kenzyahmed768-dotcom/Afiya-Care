const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["patient", "doctor","admin"],
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "approved"
  },

  specialty: String,
  experience: Number,
  certificate: String
});

module.exports = mongoose.model("User", userSchema);