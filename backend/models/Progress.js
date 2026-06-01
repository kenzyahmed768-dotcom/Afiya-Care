
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    patient:      { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
    doctor:       { type: mongoose.Schema.Types.ObjectId, ref: "Doctor",      required: true },
    appointment:  { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: false },
    recoveryPct:  { type: Number, min: 0, max: 100, required: true },
    note:         { type: String, trim: true, default: "" },
    sessionDate:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);