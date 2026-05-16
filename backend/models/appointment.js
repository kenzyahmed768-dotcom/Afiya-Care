const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false,
    },

    providerName: {
      type: String,
      default: "",
    },

    doctorName: {
      type: String,
      default: "",
    },

    labId: {
      type: String,
      default: "",
    },

    labName: {
      type: String,
      default: "",
    },

    labAddress: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    notes: {
      type: String,
      default: "",
    },

    serviceType: {
      type: String,
      default: "physiotherapy",
    },

    consultationType: {
      type: String,
      default: null,
    },

    packageName: {
      type: String,
      default: "Single",
    },

    amount: {
      type: Number,
      default: 500,
    },

    paymentMethod: {
      type: String,
      default: "cash",
    },

    location: {
      type: String,
      default: "at-clinic",
    },

    address: {
      type: String,
      default: "",
    },

    patientName: {
      type: String,
      default: "",
    },

    patientEmail: {
      type: String,
      default: "",
    },

    patientPhone: {
      type: String,
      default: "",
    },

    reminded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);