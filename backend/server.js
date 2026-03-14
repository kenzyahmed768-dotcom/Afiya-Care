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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// -----------------
// Multer
// -----------------
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

// -----------------
// DB & Models
// -----------------
const connectDB = require("./config/db");
connectDB();
const User        = require("./models/user");
const Appointment = require("./models/appointment");
const Message     = require("./models/message");

// -----------------
// Nodemailer
// -----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// -----------------
// Middleware
// -----------------
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

// ======================
// AUTH
// ======================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, specialty, experience } = req.body;
    if (await User.findOne({ email: email.trim().toLowerCase() }))
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({
      name, email: email.trim().toLowerCase(), password: hashedPassword, role,
      specialty: role === "doctor" ? specialty : undefined,
      experience: role === "doctor" ? experience : undefined,
      status: role === "doctor" ? "pending" : "approved",
    }).save();
    res.json({ message: "Registered successfully" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ message: "Invalid credentials" });
    if (user.role === "doctor" && user.status === "pending")   return res.status(403).json({ message: "Your account is pending admin approval" });
    if (user.role === "doctor" && user.status === "rejected")  return res.status(403).json({ message: "Your account has been rejected" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, role: user.role, name: user.name });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
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
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Reset link invalid or expired" });
    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined; user.resetTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// ======================
// ADMIN ROUTES
// ======================
app.get("/admin/overview", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalDoctors, totalPatients, pendingDoctors, totalAppointments,
      pendingAppointments, confirmedAppointments, completedAppointments,
      cancelledAppointments, recentRegistrations] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor", status: "pending" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role status createdAt"),
    ]);
    res.json({ totalDoctors, totalPatients, pendingDoctors, totalAppointments,
      pendingAppointments, confirmedAppointments, completedAppointments,
      cancelledAppointments, recentRegistrations });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/pending-doctors",   authMiddleware, adminMiddleware, async (req, res) => {
  try { res.json(await User.find({ role: "doctor", status: "pending" }).select("-password")); }
  catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/admin/all-doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try { res.json(await User.find({ role: "doctor" }).select("-password").sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/admin/doctor/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const doctor = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
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

// ======================
// DOCTOR ROUTES
// ======================
app.get("/doctor/profile", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Not found" });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.patch("/doctor/profile", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const { name, specialty, experience, bio, phone } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.user.id, { name, specialty, experience, bio, phone }, { new: true }
    ).select("-password");
    res.json({ message: "Profile updated", doctor });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/doctor/profile/photo", authMiddleware, doctorMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    const doctor = await User.findByIdAndUpdate(req.user.id, { photo: photoUrl }, { new: true }).select("-password");
    res.json({ message: "Photo updated", photo: doctor.photo });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/doctor/stats", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    const [totalPatients, totalAppointments, todayAppointments,
      pendingAppointments, completedAppointments, unreadMessages] = await Promise.all([
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
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id }, { status }, { new: true }
    ).populate("patient", "name");
    if (!appt) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", appointment: appt });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/doctor/patients", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const appts = await Appointment.find({ doctor: req.user.id }).populate("patient", "name email phone createdAt");
    const seen = new Set(); const patients = [];
    for (const a of appts) {
      if (a.patient && !seen.has(String(a.patient._id))) {
        seen.add(String(a.patient._id)); patients.push(a.patient);
      }
    }
    res.json(patients);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ======================
// CHAT ROUTES
// ======================
app.get("/chat/conversations/list", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    }).populate("sender", "name photo role").populate("receiver", "name photo role").sort({ createdAt: -1 });

    const seen = new Set(); const conversations = [];
    for (const msg of messages) {
      const other = String(msg.sender._id) === req.user.id ? msg.receiver : msg.sender;
      if (!seen.has(String(other._id))) {
        seen.add(String(other._id));
        const unread = await Message.countDocuments({ sender: other._id, receiver: req.user.id, read: false });
        conversations.push({ user: other, lastMessage: msg.content, unread, updatedAt: msg.createdAt });
      }
    }
    res.json(conversations);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.get("/chat/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });
    await Message.updateMany({ sender: req.params.userId, receiver: req.user.id, read: false }, { read: true });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// ======================
// SOCKET.IO
// ======================
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    try {
      const message = await Message.create({ sender: senderId, receiver: receiverId, content });
      const populated = await message.populate("sender", "name photo");
      io.to(receiverId).emit("receiveMessage", populated);
      socket.emit("messageSent", populated);
    } catch {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("markRead", async ({ senderId, receiverId }) => {
    await Message.updateMany({ sender: senderId, receiver: receiverId, read: false }, { read: true });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) { onlineUsers.delete(userId); break; }
    }
  });
});

// ======================
// START
// ======================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));