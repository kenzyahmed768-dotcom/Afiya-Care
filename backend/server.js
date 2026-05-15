
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profiles";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

const connectDB = require("./config/db");
connectDB();
const User        = require("./models/user");
const Doctor      = require("./models/doctor");
const Admin       = require("./models/admin");
const Appointment = require("./models/appointment");
const Message     = require("./models/message");
const Application = require("./models/application");
const Review      = require("./models/review");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
const adminMiddleware  = (req, res, next) => req.user.role === "admin"  ? next() : res.status(403).json({ message: "Access denied" });
const doctorMiddleware = (req, res, next) => req.user.role === "doctor" ? next() : res.status(403).json({ message: "Access denied" });


/* ─────────────────────────────────────────────
   EMAIL HELPERS
───────────────────────────────────────────── */

function buildInvoiceEmail({ patientName, bookingId, serviceType, providerName, date, time, location, address, amount, packageName, paymentMethod, consultationType }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const isLab = serviceType === "home-lab";
  const isConsult = serviceType === "consultation";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
        
        <!-- Header -->
        <tr><td style="background:#0a1628;padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.5px;">Afiya<span style="color:#00b4a2;">Care</span></h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.6);font-size:13px;">Your health, our priority</p>
        </td></tr>

        <!-- Success banner -->
        <tr><td style="background:#00b4a2;padding:20px 40px;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:600;">✓ Booking Confirmed</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Booking ID: <strong>#${bookingId}</strong></p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;color:#3a4a5c;font-size:15px;">Hi <strong>${patientName}</strong>, your appointment has been confirmed. Here are your details:</p>

          <!-- Details table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dde8ef;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f8fafb;">
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;width:40%;">Service</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;font-weight:600;">${serviceType === "home-lab" ? "Home Lab Test" : serviceType === "consultation" ? `Consultation (${consultationType})` : "Physiotherapy"}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">${isLab ? "Lab" : "Doctor"}</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${isLab ? providerName : "Dr. " + providerName}</td>
            </tr>
            <tr style="background:#f8fafb;">
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">Date</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">Time</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${time}</td>
            </tr>
            ${!isConsult ? `
            <tr style="background:#f8fafb;">
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">Location</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${isLab ? address : (location === "at-home" ? "At Home — " + address : "At Clinic")}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">Package</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${packageName}</td>
            </tr>
            <tr style="background:#e6f9f7;">
              <td style="padding:14px 16px;font-size:13px;font-weight:700;color:#008b7c;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">Total Amount</td>
              <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#00b4a2;border-top:1px solid #dde8ef;">${amount.toLocaleString()} EGP</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #dde8ef;">Payment</td>
              <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${paymentMethod === "visa" ? "💳 Visa Card (Paid Online)" : "💵 Cash (Pay on arrival)"}</td>
            </tr>
          </table>

          <p style="margin:0 0 8px;color:#3a4a5c;font-size:14px;">Need to cancel? Log into your <strong>patient dashboard</strong> and tap <strong>Cancel</strong> on the appointment. You can also reply to this email.</p>
          <p style="margin:0;color:#3a4a5c;font-size:14px;">You will receive a reminder email 24 hours before your appointment.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafb;padding:20px 40px;border-top:1px solid #dde8ef;">
          <p style="margin:0;color:#6b7c93;font-size:12px;">AfiyaCare · Alexandria, Egypt · afiyacare@gmail.com · +20 12345677</p>
          <p style="margin:4px 0 0;color:#6b7c93;font-size:11px;">This is an automated email. Please do not reply directly to this address.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildReminderEmail({ patientName, providerName, date, time, serviceType, isLab }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0a1628;padding:28px 40px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">Afiya<span style="color:#00b4a2;">Care</span></h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 12px;color:#0a1628;font-size:20px;">⏰ Appointment Reminder</h2>
          <p style="color:#3a4a5c;font-size:15px;">Hi <strong>${patientName}</strong>, this is a reminder that you have an appointment tomorrow:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;border-radius:8px;padding:16px;margin:20px 0;">
            <tr><td style="padding:8px 0;color:#6b7c93;font-size:13px;">With</td><td style="padding:8px 0;color:#0a1628;font-size:14px;font-weight:600;">${isLab ? providerName : "Dr. " + providerName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7c93;font-size:13px;">Date</td><td style="padding:8px 0;color:#0a1628;font-size:14px;">${formattedDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7c93;font-size:13px;">Time</td><td style="padding:8px 0;color:#0a1628;font-size:14px;font-weight:600;">${time}</td></tr>
          </table>
          <p style="color:#3a4a5c;font-size:14px;">Need to cancel? Log into your patient dashboard before the appointment.</p>
        </td></tr>
        <tr><td style="background:#f8fafb;padding:16px 40px;border-top:1px solid #dde8ef;">
          <p style="margin:0;color:#6b7c93;font-size:12px;">AfiyaCare · afiyacare@gmail.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildCancellationEmail({ patientName, providerName, date, time, isLab }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0a1628;padding:28px 40px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">Afiya<span style="color:#00b4a2;">Care</span></h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 12px;color:#ef4444;font-size:20px;">Appointment Cancelled</h2>
          <p style="color:#3a4a5c;font-size:15px;">Hi <strong>${patientName}</strong>, your appointment has been cancelled:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;padding:16px;margin:20px 0;">
            <tr><td style="padding:8px 0;color:#6b7c93;font-size:13px;">With</td><td style="padding:8px 0;color:#0a1628;font-size:14px;font-weight:600;">${isLab ? providerName : "Dr. " + providerName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7c93;font-size:13px;">Date</td><td style="padding:8px 0;color:#0a1628;font-size:14px;">${formattedDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7c93;font-size:13px;">Time</td><td style="padding:8px 0;color:#0a1628;font-size:14px;">${time}</td></tr>
          </table>
          <p style="color:#3a4a5c;font-size:14px;">If you did not request this cancellation, please contact us at afiyacare@gmail.com or +20 12345677.</p>
          <p style="color:#3a4a5c;font-size:14px;">You can book a new appointment anytime on our website.</p>
        </td></tr>
        <tr><td style="background:#f8fafb;padding:16px 40px;border-top:1px solid #dde8ef;">
          <p style="margin:0;color:#6b7c93;font-size:12px;">AfiyaCare · afiyacare@gmail.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ─────────────────────────────────────────────
   AUTH ROUTES
───────────────────────────────────────────── */

app.post("/register", async (req, res) => {
  try {
    const { name, age, email, password, role, specialty, experience } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const [existingUser, existingDoctor, existingAdmin] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Doctor.findOne({ email: normalizedEmail }),
      Admin.findOne({ email: normalizedEmail }),
    ]);

    if (existingUser || existingDoctor || existingAdmin)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "doctor") {
      await new Doctor({ name, age, email: normalizedEmail, password: hashedPassword, role: "doctor", specialty, experience, status: "pending" }).save();
    } else if (role === "admin") {
      await new Admin({ name, age, email: normalizedEmail, password: hashedPassword, role: "admin", status: "approved" }).save();
    } else {
      await new User({ name, age, email: normalizedEmail, password: hashedPassword, role: "patient", status: "approved" }).save();
    }

    res.json({ message: "Registered successfully" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    let role = "patient";
    if (!user) { user = await Doctor.findOne({ email: normalizedEmail }); role = "doctor"; }
    if (!user) { user = await Admin.findOne({ email: normalizedEmail }); role = "admin"; }
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ message: "Invalid credentials" });
    if (role === "doctor" && user.status === "pending") return res.status(403).json({ message: "Your account is pending admin approval" });
    if (role === "doctor" && user.status === "rejected") return res.status(403).json({ message: "Your account has been rejected" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, role: user.role, name: user.name });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) user = await Doctor.findOne({ email: normalizedEmail });
    if (!user) user = await Admin.findOne({ email: normalizedEmail });
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: `"Afiya Care" <${process.env.EMAIL_USER}>`, to: email,
      subject: "Password Reset", html: `<p>Reset your password: <a href="${resetURL}">${resetURL}</a></p>`,
    });
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "New password required" });
  try {
    let user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) user = await Doctor.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) user = await Admin.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Reset link invalid or expired" });

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   ADMIN ROUTES
───────────────────────────────────────────── */

app.get("/admin/overview", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalDoctors, totalPatients, pendingDoctors, totalAppointments,
      pendingAppointments, confirmedAppointments, completedAppointments,
      cancelledAppointments, recentUsers, recentDoctors] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments({ status: "pending" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      User.find().sort({ createdAt: -1 }).limit(3).select("name email role status createdAt"),
      Doctor.find().sort({ createdAt: -1 }).limit(2).select("name email role status createdAt"),
    ]);

    const recentRegistrations = [...recentUsers, ...recentDoctors]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    res.json({ totalDoctors, totalPatients, pendingDoctors, totalAppointments, pendingAppointments, confirmedAppointments, completedAppointments, cancelledAppointments, recentRegistrations });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/pending-doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try { res.json(await Doctor.find({ status: "pending" }).select("-password")); }
  catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/all-doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try { res.json(await Doctor.find().select("-password").sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/admin/doctor/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: `Doctor ${status}`, doctor });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/appointments", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    res.json(await Appointment.find()
      .populate("doctor", "name specialty").populate("patient", "name email").sort({ date: -1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/admin/appointments/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending","confirmed","cancelled","completed"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("doctor", "name").populate("patient", "name");
    if (!appt) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", appointment: appt });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/schedules/doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    res.json(await Appointment.find()
      .populate("doctor", "name email specialty").populate("patient", "name email").sort({ date: 1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/schedules/patients", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    res.json(await Appointment.find()
      .populate("patient", "name email").populate("doctor", "name email specialty").sort({ date: 1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/support/agent", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findOne().select("_id name");
    if (!admin) return res.status(404).json({ message: "No support agent available" });
    res.json({ agentId: admin._id, name: admin.name });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   APPLICATIONS
───────────────────────────────────────────── */

app.post("/applications", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, experience, message } = req.body;
    if (!firstName || !lastName || !email || !role)
      return res.status(400).json({ message: "Please fill in all required fields." });
    const application = await new Application({ firstName, lastName, email, phone, role, experience, message }).save();
    res.status(201).json({ message: "Application submitted successfully!", application });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/applications", authMiddleware, adminMiddleware, async (req, res) => {
  try { res.json(await Application.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/admin/applications/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "reviewed", "accepted", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ message: `Application marked as ${status}`, application });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/admin/applications/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   BOOKING ROUTES
───────────────────────────────────────────── */

app.get("/booking/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" })
      .select("-password -resetToken -resetTokenExpiry").sort({ name: 1 });
    res.json(doctors);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/booking/slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId and date required" });
    const start = new Date(date); start.setHours(0,0,0,0);
    const end   = new Date(date); end.setHours(23,59,59,999);
    const appointments = await Appointment.find({ doctor: doctorId, date: { $gte: start, $lte: end }, status: { $ne: "cancelled" } }).select("time");
    res.json(appointments.map(a => a.time));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/booking/create", authMiddleware, async (req, res) => {
  try {
    const {
      doctorId, labId, labName, labAddress,
      date, time, reason, paymentMethod,
      location, address, serviceType, consultationType,
      packageName, amount,
      patientName, patientEmail, patientPhone,
    } = req.body;

    const isLab = serviceType === "home-lab";

    if (!isLab && !doctorId) return res.status(400).json({ message: "Doctor is required" });
    if (isLab && !labId) return res.status(400).json({ message: "Lab is required" });
    if (!date || !time) return res.status(400).json({ message: "Date and time are required" });

    if (!isLab) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor || doctor.status !== "approved")
        return res.status(404).json({ message: "Doctor not found or not available" });

      const start = new Date(date); start.setHours(0,0,0,0);
      const end   = new Date(date); end.setHours(23,59,59,999);
      const existing = await Appointment.findOne({ doctor: doctorId, date: { $gte: start, $lte: end }, time, status: { $ne: "cancelled" } });
      if (existing) return res.status(409).json({ message: "This time slot is already booked. Please choose another." });
    }

    const appointmentData = {
      patient: req.user.id,
      date: new Date(date),
      time,
      reason: reason || "",
      status: "pending",
      serviceType: serviceType || "physiotherapy",
      consultationType: consultationType || null,
      packageName: packageName || "Single",
      amount: amount || 500,
      paymentMethod: paymentMethod || "cash",
      location: location || "at-clinic",
      address: address || "",
      patientName: patientName || "",
      patientEmail: patientEmail || "",
      patientPhone: patientPhone || "",
      reminded: false,
    };

    if (isLab) {
      appointmentData.labId = labId;
      appointmentData.labName = labName;
      appointmentData.labAddress = labAddress;
    } else {
      appointmentData.doctor = doctorId;
    }

    const appointment = await new Appointment(appointmentData).save();

    // Send confirmation email with invoice
    if (patientEmail) {
      let providerName = labName || "Unknown";
      if (!isLab) {
        const doc = await Doctor.findById(doctorId).select("name email");
        providerName = doc ? (doc.name || doc.email.split("@")[0]) : "Doctor";
      }

      const invoiceHtml = buildInvoiceEmail({
        patientName: patientName || "Patient",
        bookingId: appointment._id.toString().slice(-8).toUpperCase(),
        serviceType,
        providerName,
        date,
        time,
        location,
        address: isLab ? labAddress : address,
        amount: amount || 500,
        packageName: packageName || "Single",
        paymentMethod: paymentMethod || "cash",
        consultationType,
      });

      transporter.sendMail({
        from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
        to: patientEmail,
        subject: "✅ Your AfiyaCare Booking is Confirmed",
        html: invoiceHtml,
      }).catch(err => console.error("Invoice email error:", err));
    }

    res.status(201).json({ message: "Appointment booked successfully!", appointment });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/booking/init-chat", authMiddleware, async (req, res) => {
  try {
    const { receiverId, appointmentDate, appointmentTime } = req.body;
    const senderId = req.user.id;
    const existing = await Message.findOne({ $or: [{ sender: senderId, receiver: receiverId }, { sender: receiverId, receiver: senderId }] });
    if (!existing) {
      const formattedDate = new Date(appointmentDate).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
      const content = `Hello! I just booked an appointment with you on ${formattedDate} at ${appointmentTime}. Looking forward to my session!`;
      await Message.create({ sender: senderId, senderModel: req.user.role === "doctor" ? "Doctor" : "User", receiver: receiverId, receiverModel: "Doctor", content });
    }
    res.json({ message: "Chat initialized" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   PATIENT CANCEL APPOINTMENT
───────────────────────────────────────────── */

app.patch("/patient/appointments/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (!["pending", "confirmed"].includes(appointment.status))
      return res.status(400).json({ message: "Only pending or confirmed appointments can be cancelled" });

    appointment.status = "cancelled";
    await appointment.save();

    // Send cancellation email
    const emailTo = appointment.patientEmail;
    if (emailTo) {
      let providerName = appointment.labName || "Unknown";
      if (appointment.doctor) {
        const doc = await Doctor.findById(appointment.doctor).select("name email");
        providerName = doc ? (doc.name || doc.email.split("@")[0]) : "Doctor";
      }

      const cancelHtml = buildCancellationEmail({
        patientName: appointment.patientName || "Patient",
        providerName,
        date: appointment.date,
        time: appointment.time,
        isLab: appointment.serviceType === "home-lab",
      });

      transporter.sendMail({
        from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
        to: emailTo,
        subject: "Appointment Cancelled — AfiyaCare",
        html: cancelHtml,
      }).catch(err => console.error("Cancellation email error:", err));
    }

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   DOCTOR ROUTES
───────────────────────────────────────────── */

app.get("/doctor/profile", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Not found" });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/doctor/profile", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const { name, specialty, experience, bio, phone } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(req.user.id, { name, specialty, experience, bio, phone }, { new: true }).select("-password");
    res.json({ message: "Profile updated", doctor });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/doctor/profile/photo", authMiddleware, doctorMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    const doctor = await Doctor.findByIdAndUpdate(req.user.id, { photo: photoUrl }, { new: true }).select("-password");
    res.json({ message: "Photo updated", photo: doctor.photo });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/doctor/stats", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    const [totalPatients, totalAppointments, todayAppointments, pendingAppointments, completedAppointments, unreadMessages] = await Promise.all([
      Appointment.distinct("patient", { doctor: req.user.id }).then(r => r.length),
      Appointment.countDocuments({ doctor: req.user.id }),
      Appointment.countDocuments({ doctor: req.user.id, date: { $gte: start, $lte: end } }),
      Appointment.countDocuments({ doctor: req.user.id, status: "pending" }),
      Appointment.countDocuments({ doctor: req.user.id, status: "completed" }),
      Message.countDocuments({ receiver: req.user.id, read: false }),
    ]);
    res.json({ totalPatients, totalAppointments, todayAppointments, pendingAppointments, completedAppointments, unreadMessages });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/doctor/schedule/today", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    res.json(await Appointment.find({ doctor: req.user.id, date: { $gte: start, $lte: end } })
      .populate("patient", "name email phone").sort({ time: 1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/doctor/appointments", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    res.json(await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email phone").sort({ date: -1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/doctor/appointments/:id", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed","completed","cancelled"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const appt = await Appointment.findOneAndUpdate({ _id: req.params.id, doctor: req.user.id }, { status }, { new: true }).populate("patient", "name");
    if (!appt) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", appointment: appt });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/doctor/patients", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const appts = await Appointment.find({ doctor: req.user.id }).populate("patient", "name email phone createdAt");
    const seen = new Set(); const patients = [];
    for (const a of appts) {
      if (a.patient && !seen.has(String(a.patient._id))) { seen.add(String(a.patient._id)); patients.push(a.patient); }
    }
    res.json(patients);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   PATIENT ROUTES
───────────────────────────────────────────── */

app.get("/patient/profile", authMiddleware, async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select("-password");
    if (!patient) return res.status(404).json({ message: "Not found" });
    res.json(patient);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/patient/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const patient = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true }).select("-password");
    res.json({ message: "Profile updated", patient });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/patient/profile/photo", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    const patient = await User.findByIdAndUpdate(req.user.id, { photo: photoUrl }, { new: true }).select("-password");
    res.json({ message: "Photo updated", photo: patient.photo });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/patient/appointments", authMiddleware, async (req, res) => {
  try {
    res.json(await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialty").sort({ date: -1 }));
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/patient/reviews", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user.id }).populate("doctor", "name specialty").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) { console.error(error); res.status(500).json({ message: "Server error" }); }
});

app.post("/patient/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, title, comment, doctorId, appointmentId } = req.body;
    if (!rating || !comment) return res.status(400).json({ message: "Rating and comment are required" });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
    const review = new Review({ patient: req.user.id, doctor: doctorId || null, appointment: appointmentId || null, rating, title: title || "", comment: comment.trim(), status: "pending", isPublic: false });
    await review.save();
    await review.populate("patient", "name email");
    if (doctorId) await review.populate("doctor", "name specialty");
    res.status(201).json({ message: "Review submitted successfully! It will be visible after admin approval.", review });
  } catch (error) { console.error(error); res.status(500).json({ message: "Server error" }); }
});

app.get("/patient/appointments/completed", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id, status: "completed" })
      .populate("doctor", "name specialty").sort({ date: -1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   CHAT ROUTES
───────────────────────────────────────────── */

app.get("/chat/conversations/list", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] })
      .populate("sender", "name photo role").populate("receiver", "name photo role").sort({ createdAt: -1 });
    const seen = new Set(); const conversations = [];
    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;
      const other = String(msg.sender._id) === String(req.user.id) ? msg.receiver : msg.sender;
      if (!seen.has(String(other._id))) {
        seen.add(String(other._id));
        const unread = await Message.countDocuments({ sender: other._id, receiver: req.user.id, read: false });
        conversations.push({ user: other, lastMessage: msg.content, unread, updatedAt: msg.createdAt });
      }
    }
    res.json(conversations);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/chat/admin/conversations", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id }).populate("sender", "name photo role").sort({ createdAt: -1 });
    const seen = new Set(); const conversations = [];
    for (const msg of messages) {
      if (!msg.sender) continue;
      const id = String(msg.sender._id);
      if (!seen.has(id)) {
        seen.add(id);
        const unread = await Message.countDocuments({ sender: msg.sender._id, receiver: req.user.id, read: false });
        conversations.push({ user: msg.sender, lastMessage: msg.content, unread, time: msg.createdAt });
      }
    }
    res.json(conversations);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/chat/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ sender: req.user.id, receiver: req.params.userId }, { sender: req.params.userId, receiver: req.user.id }] }).sort({ createdAt: 1 });
    await Message.updateMany({ sender: req.params.userId, receiver: req.user.id, read: false }, { read: true });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   REVIEW ADMIN ROUTES
───────────────────────────────────────────── */

app.get("/admin/reviews", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const reviews = await Review.find(query).populate("patient", "name email").populate("doctor", "name specialty").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/reviews/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Review.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } }]);
    const total    = stats.reduce((sum, s) => sum + s.count, 0);
    const pending  = stats.find(s => s._id === "pending")?.count || 0;
    const approved = stats.find(s => s._id === "approved")?.count || 0;
    const rejected = stats.find(s => s._id === "rejected")?.count || 0;
    res.json({ total, pending, approved, rejected, stats });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/admin/reviews/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const review = await Review.findByIdAndUpdate(req.params.id, { status, isPublic: status === "approved", adminNotes, reviewedBy: req.user.id, reviewedAt: new Date() }, { new: true }).populate("patient", "name").populate("doctor", "name");
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: `Review ${status}`, review });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.delete("/admin/reviews/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

/* ─────────────────────────────────────────────
   REMINDER CRON — runs every hour
   Finds appointments in the next 24 hrs that
   haven't been reminded yet, sends email + 
   socket notification
───────────────────────────────────────────── */

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const upcoming = await Appointment.find({
      date: { $gte: in24h, $lte: in25h },
      status: { $in: ["pending", "confirmed"] },
      reminded: { $ne: true },
    });

    for (const appt of upcoming) {
      let providerName = appt.labName || "Unknown";
      if (appt.doctor) {
        const doc = await Doctor.findById(appt.doctor).select("name email");
        providerName = doc ? (doc.name || doc.email.split("@")[0]) : "Doctor";
      }

      const patientEmail = appt.patientEmail;
      const patientName  = appt.patientName || "Patient";
      const isLab = appt.serviceType === "home-lab";

      // Send reminder email
      if (patientEmail) {
        const reminderHtml = buildReminderEmail({ patientName, providerName, date: appt.date, time: appt.time, serviceType: appt.serviceType, isLab });
        transporter.sendMail({
          from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
          to: patientEmail,
          subject: "⏰ Reminder: Your AfiyaCare Appointment is Tomorrow",
          html: reminderHtml,
        }).catch(err => console.error("Reminder email error:", err));
      }

      // Send in-app socket notification
      if (appt.patient) {
        io.to(String(appt.patient)).emit("reminder", {
          message: `Reminder: Your ${appt.serviceType?.replace("-"," ")} appointment with ${providerName} is tomorrow at ${appt.time}.`,
          appointmentId: appt._id,
          time: appt.time,
          date: appt.date,
          providerName,
        });
      }

      // Mark as reminded
      appt.reminded = true;
      await appt.save();
    }

    if (upcoming.length > 0) console.log(`Sent ${upcoming.length} reminder(s)`);
  } catch (err) {
    console.error("Cron reminder error:", err);
  }
});

/* ─────────────────────────────────────────────
   SOCKET.IO
───────────────────────────────────────────── */

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers.set(String(userId), socket.id);
    socket.join(String(userId));
  });

  socket.on("sendMessage", async ({ senderId, receiverId, content, senderModel, receiverModel }) => {
    if (!senderId || !receiverId || !content?.trim()) return;
    try {
      const message = await Message.create({
        sender: senderId, senderModel: senderModel || "User",
        receiver: receiverId, receiverModel: receiverModel || "Admin",
        content: content.trim(), read: false,
      });
      await message.populate("sender", "name photo role");
      socket.emit("messageSent", message);
      io.to(String(receiverId)).emit("receiveMessage", message);
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("markRead", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany({ sender: senderId, receiver: receiverId, read: false }, { read: true });
    } catch (err) { console.error("markRead error:", err); }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) { onlineUsers.delete(userId); break; }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

