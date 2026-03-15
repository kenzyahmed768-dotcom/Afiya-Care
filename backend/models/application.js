const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  email:      { type: String, required: true },
  phone:      { type: String, default: "" },
  role:       { type: String, required: true },
  experience: { type: String, default: "" },
  message:    { type: String, default: "" },
  status:     { type: String, enum: ["pending", "reviewed", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);