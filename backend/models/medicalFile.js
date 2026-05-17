const mongoose = require("mongoose");

const medicalFileSchema = new mongoose.Schema(
  {
    patient:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename:   { type: String, required: true },   
    storedName: { type: String, required: true },   
    url:        { type: String, required: true },   
    mimetype:   { type: String, default: "" },
    size:       { type: Number, default: 0 },       
    label:      { type: String, default: "" },      
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalFile", medicalFileSchema);