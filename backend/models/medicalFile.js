const mongoose = require("mongoose");

const medicalFileSchema = new mongoose.Schema(
  {
    patient:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename:   { type: String, required: true },   // original file name shown to user
    storedName: { type: String, required: true },   // actual name saved on disk
    url:        { type: String, required: true },   // e.g. /uploads/medical/abc.pdf
    mimetype:   { type: String, default: "" },
    size:       { type: Number, default: 0 },       // bytes
    label:      { type: String, default: "" },      // user-supplied note/label
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalFile", medicalFileSchema);