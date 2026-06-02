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



app.use(cors());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

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
    if (/jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"));
    }
  },
});

const medicalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/medical";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(
      null,
      `${req.user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    );
  },
});

const uploadMedical = multer({
  storage: medicalStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (/^(jpeg|jpg|png|webp|pdf|doc|docx|txt)$/.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ".${ext}" is not allowed`));
    }
  },
});

function multerArray(field, maxCount) {
  return (req, res, next) => {
    uploadMedical.array(field, maxCount)(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            message: "File too large. Maximum size is 20MB per file.",
          });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            message: "Too many files. Maximum is 10 files at once.",
          });
        }

        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
      }

      return res.status(400).json({
        message: err.message || "Invalid file type",
      });
    });
  };
}

const connectDB = require("./config/db");
connectDB();

const User = require("./models/user");
const Doctor = require("./models/doctor");
const Admin = require("./models/admin");
const Appointment = require("./models/appointment");
const Message = require("./models/message");
const Application = require("./models/application");
const Review = require("./models/review");
const MedicalFile = require("./models/medicalFile");
const Progress = require("./models/Progress");


const {
  buildInvoiceEmail,
  buildReminderEmail,
  buildCancellationEmail,
} = require("./models/emailTemplates");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminMiddleware = (req, res, next) =>
  req.user.role === "admin"
    ? next()
    : res.status(403).json({ message: "Access denied" });

const doctorMiddleware = (req, res, next) =>
  req.user.role === "doctor"
    ? next()
    : res.status(403).json({ message: "Access denied" });

async function resolveModel(userId) {
  if (!userId) return "User";

  const id = String(userId);

  if (await Doctor.exists({ _id: id })) return "Doctor";
  if (await Admin.exists({ _id: id })) return "Admin";

  return "User";
}



// ==========================================
// AUTH ROUTES
// ==========================================

app.post("/register", async (req, res) => {
  try {
    const { name, age, email, password, role, specialty, experience } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const [existingUser, existingDoctor, existingAdmin] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Doctor.findOne({ email: normalizedEmail }),
      Admin.findOne({ email: normalizedEmail }),
    ]);

    if (existingUser || existingDoctor || existingAdmin) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "doctor") {
      await new Doctor({
        name,
        age,
        email: normalizedEmail,
        password: hashedPassword,
        role: "doctor",
        specialty,
        experience,
        status: "pending",
      }).save();
    } else if (role === "admin") {
      await new Admin({
        name,
        age,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
        status: "approved",
      }).save();
    } else {
      await new User({
        name,
        age,
        email: normalizedEmail,
        password: hashedPassword,
        role: "patient",
        status: "approved",
      }).save();
    }

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    let role = "patient";

    if (!user) {
      user = await Doctor.findOne({ email: normalizedEmail });
      role = "doctor";
    }

    if (!user) {
      user = await Admin.findOne({ email: normalizedEmail });
      role = "admin";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (role === "doctor" && user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }

    if (role === "doctor" && user.status === "rejected") {
      return res.status(403).json({ message: "Your account has been rejected" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) user = await Doctor.findOne({ email: normalizedEmail });
    if (!user) user = await Admin.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;

    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `<p>Reset your password: <a href="${resetURL}">${resetURL}</a></p>`,
    });

    res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password required" });
  }

  try {
    let user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      user = await Doctor.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });
    }

    if (!user) {
      user = await Admin.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Reset link invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// ADMIN ROUTES
// ==========================================

// GET /admin/overview  ← WAS MISSING
app.get("/admin/overview", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      pendingDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      recentRegistrations,
    ] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments(),
      Doctor.countDocuments({ status: "pending" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Promise.all([
        User.find()
          .select("name email role createdAt")
          .sort({ createdAt: -1 })
          .limit(5),
        Doctor.find()
          .select("name email role createdAt")
          .sort({ createdAt: -1 })
          .limit(5),
      ]).then(([users, doctors]) =>
        [...users, ...doctors]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      ),
    ]);

    res.json({
      totalDoctors,
      totalPatients,
      pendingDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      recentRegistrations,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/pending-doctors  ← WAS MISSING
app.get("/admin/pending-doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "pending" })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (err) {
    console.error("Admin pending doctors fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/all-doctors  ← WAS MISSING
app.get("/admin/all-doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (err) {
    console.error("Admin all doctors fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /admin/doctor/:id  ← WAS MISSING
app.patch("/admin/doctor/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: `Doctor ${status}`, doctor });
  } catch (err) {
    console.error("Admin doctor update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /admin/doctors/:id  ← WAS MISSING
app.delete("/admin/doctors/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await Promise.all([
      Appointment.deleteMany({ doctor: req.params.id }),
      Message.deleteMany({
        $or: [{ sender: req.params.id }, { receiver: req.params.id }],
      }),
      Review.deleteMany({ doctor: req.params.id }),
    ]);

    await doctor.deleteOne();

    res.json({ message: "Doctor deleted" });
  } catch (err) {
    console.error("Admin doctor delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/appointments  ← WAS MISSING
app.get("/admin/appointments", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name email specialty")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("Admin appointments fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /admin/appointments/:id  ← WAS MISSING
app.patch("/admin/appointments/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment updated", appointment });
  } catch (err) {
    console.error("Admin appointment update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /admin/appointments/:id  ← WAS MISSING
app.delete("/admin/appointments/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error("Admin appointment delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/patients", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const patients = await User.find()
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (err) {
    console.error("Admin patients fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/admin/patients/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient updated", patient });
  } catch (err) {
    console.error("Admin patient update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/admin/patients/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await Promise.all([
      Appointment.deleteMany({ patient: req.params.id }),
      Message.deleteMany({
        $or: [{ sender: req.params.id }, { receiver: req.params.id }],
      }),
      Review.deleteMany({ patient: req.params.id }),
      MedicalFile.deleteMany({ patient: req.params.id }),
    ]);

    await patient.deleteOne();

    res.json({ message: "Patient deleted" });
  } catch (err) {
    console.error("Admin patient delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/medical-files", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const files = await MedicalFile.find()
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (err) {
    console.error("Admin medical files fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/admin/medical-files/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const file = await MedicalFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "Medical file not found" });
    }

    const diskPath = path.join(__dirname, "uploads/medical", file.storedName);

    if (file.storedName && fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    await file.deleteOne();

    res.json({ message: "Medical file deleted" });
  } catch (err) {
    console.error("Admin medical file delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/messages", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email role photo")
      .populate("receiver", "name email role photo")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("Admin messages fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/admin/messages/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("Admin message delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/reviews", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const reviews = await Review.find(query)
      .populate("patient", "name email")
      .populate("doctor", "name specialty")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Admin reviews fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/reviews/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const pending = stats.find((s) => s._id === "pending")?.count || 0;
    const approved = stats.find((s) => s._id === "approved")?.count || 0;
    const rejected = stats.find((s) => s._id === "rejected")?.count || 0;

    res.json({ total, pending, approved, rejected, stats });
  } catch (err) {
    console.error("Admin review stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/admin/reviews/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isPublic: status === "approved",
        adminNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    )
      .populate("patient", "name")
      .populate("doctor", "name");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: `Review ${status}`, review });
  } catch (err) {
    console.error("Admin review update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/admin/reviews/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Admin review delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/applications", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Admin applications fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/admin/applications/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: `Application marked as ${status}`, application });
  } catch (err) {
    console.error("Admin application update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/admin/applications/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted" });
  } catch (err) {
    console.error("Admin application delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/debug-counts", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      users,
      doctors,
      admins,
      appointments,
      messages,
      medicalFiles,
      applications,
      reviews,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Admin.countDocuments(),
      Appointment.countDocuments(),
      Message.countDocuments(),
      MedicalFile.countDocuments(),
      Application.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      users,
      patients: users,
      doctors,
      admins,
      appointments,
      messages,
      medicalFiles,
      applications,
      reviews,
    });
  } catch (err) {
    console.error("Admin debug counts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// APPLICATIONS ROUTES
// ==========================================

app.post("/applications", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, experience, message } =
      req.body;

    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const application = await new Application({
      firstName,
      lastName,
      email,
      phone,
      role,
      experience,
      message,
    }).save();

    res.status(201).json({
      message: "Application submitted successfully!",
      application,
    });
  } catch (err) {
    console.error("Application submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// BOOKING ROUTES
// ==========================================

app.get("/booking/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ name: 1 });

    res.json(doctors);
  } catch (err) {
    console.error("Booking doctors fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/booking/slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date required" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    }).select("time");

    res.json(appointments.map((a) => a.time));
  } catch (err) {
    console.error("Booking slots fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/booking/create", authMiddleware, async (req, res) => {
  try {
    const {
      doctorId,
      labId,
      labName,
      labAddress,
      date,
      time,
      reason,
      paymentMethod,
      location,
      address,
      serviceType,
      consultationType,
      packageName,
      amount,
      patientName,
      patientEmail,
      patientPhone,
    } = req.body;

    const isLab = serviceType === "home-lab";

    if (!isLab && !doctorId) {
      return res.status(400).json({ message: "Doctor is required" });
    }

    if (isLab && !labId) {
      return res.status(400).json({ message: "Lab is required" });
    }

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    let selectedDoctor = null;

    if (!isLab) {
      selectedDoctor = await Doctor.findById(doctorId).select(
        "name email status specialty"
      );

      if (!selectedDoctor || selectedDoctor.status !== "approved") {
        return res.status(404).json({
          message: "Doctor not found or not available",
        });
      }

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const existing = await Appointment.findOne({
        doctor: doctorId,
        date: { $gte: start, $lte: end },
        time,
        status: { $ne: "cancelled" },
      });

      if (existing) {
        return res.status(409).json({
          message: "This time slot is already booked. Please choose another.",
        });
      }
    }

    const providerName = isLab
      ? labName || "Lab"
      : selectedDoctor?.name ||
        selectedDoctor?.email?.split("@")[0] ||
        "Doctor";

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
      providerName,
      doctorName: !isLab ? providerName : "",
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

    if (patientEmail) {
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

      transporter
        .sendMail({
          from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
          to: patientEmail,
          subject: "✅ Your AfiyaCare Booking is Confirmed",
          html: invoiceHtml,
        })
        .catch((err) => console.error("Invoice email error:", err));
    }

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (err) {
    console.error("Booking create error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/booking/init-chat", authMiddleware, async (req, res) => {
  try {
    const { receiverId, appointmentDate, appointmentTime } = req.body;
    const senderId = req.user.id;

    const existing = await Message.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (!existing) {
      const senderModel = await resolveModel(senderId);
      const receiverModel = await resolveModel(receiverId);

      const formattedDate = new Date(appointmentDate).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      );

      const content = `Hello! I just booked an appointment with you on ${formattedDate} at ${appointmentTime}. Looking forward to my session!`;

      await Message.create({
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        content,
      });
    }

    res.json({ message: "Chat initialized" });
  } catch (err) {
    console.error("Booking init chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// PATIENT ROUTES
// ==========================================

app.patch("/patient/appointments/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id,
    }).populate("doctor", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!["pending", "confirmed"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Only pending or confirmed appointments can be cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    const emailTo = appointment.patientEmail;

    if (emailTo) {
      const isLab = appointment.serviceType === "home-lab";
      let providerName = appointment.labName || "Unknown";

      if (!isLab && appointment.doctor) {
        providerName =
          appointment.doctor.name ||
          appointment.doctor.email?.split("@")[0] ||
          "Doctor";
      }

      const cancelHtml = buildCancellationEmail({
        patientName: appointment.patientName || "Patient",
        providerName,
        date: appointment.date,
        time: appointment.time,
        isLab,
      });

      transporter
        .sendMail({
          from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
          to: emailTo,
          subject: "Appointment Cancelled — AfiyaCare",
          html: cancelHtml,
        })
        .catch((err) => console.error("Cancellation email error:", err));
    }

    const notificationPayload = {
      type: "appointment_cancelled",
      appointmentId: appointment._id,
      patientName: appointment.patientName || req.user.name || "A patient",
      doctorName: appointment.doctor?.name || "Unknown",
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason || "General Consultation",
      message: `${appointment.patientName || "A patient"} cancelled their appointment on ${new Date(
        appointment.date
      ).toDateString()}${appointment.time ? " at " + appointment.time : ""}.`,
    };

    if (appointment.doctor?._id) {
      io.to(String(appointment.doctor._id)).emit(
        "appointmentCancelled",
        notificationPayload
      );
    }

    io.to("admins").emit("appointmentCancelled", notificationPayload);

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    console.error("Patient appointment cancel error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/patient/profile", authMiddleware, async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("Patient profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/patient/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const patient = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", patient });
  } catch (err) {
    console.error("Patient profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/patient/profile/photo", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    const patient = await User.findByIdAndUpdate(
      req.user.id,
      { photo: photoUrl },
      { new: true }
    ).select("-password");

    res.json({ message: "Photo updated", photo: patient.photo });
  } catch (err) {
    console.error("Patient photo update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/patient/appointments", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name email specialty")
      .sort({ date: -1 });

    const fixedAppointments = appointments.map((appt) => {
      const obj = appt.toObject();

      obj.providerName =
        obj.doctor?.name ||
        obj.doctorName ||
        obj.labName ||
        obj.providerName ||
        "Provider";

      return obj;
    });

    res.json(fixedAppointments);
  } catch (err) {
    console.error("Patient appointments fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/patient/appointments/completed", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id,
      status: "completed",
    })
      .populate("doctor", "name specialty")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("Patient completed appointments fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/patient/reviews", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user.id })
      .populate("doctor", "name specialty")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Patient reviews fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/patient/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, title, comment, doctorId, appointmentId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const review = new Review({
      patient: req.user.id,
      doctor: doctorId || null,
      appointment: appointmentId || null,
      rating,
      title: title || "",
      comment: comment.trim(),
      status: "pending",
      isPublic: false,
    });

    await review.save();
    await review.populate("patient", "name email");

    if (doctorId) {
      await review.populate("doctor", "name specialty");
    }

    res.status(201).json({
      message: "Review submitted successfully! It will be visible after admin approval.",
      review,
    });
  } catch (error) {
    console.error("Patient review submit error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/patient/files", authMiddleware, multerArray("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const labels = req.body.labels ? JSON.parse(req.body.labels) : [];

    const saved = await Promise.all(
      req.files.map((f, i) =>
        new MedicalFile({
          patient: req.user.id,
          filename: f.originalname,
          storedName: f.filename,
          url: `/uploads/medical/${f.filename}`,
          mimetype: f.mimetype,
          size: f.size,
          label: labels[i] || "",
        }).save()
      )
    );

    res.status(201).json({ message: "Files uploaded", files: saved });
  } catch (err) {
    console.error("Medical file upload error:", err);
    res.status(500).json({ message: "Upload failed", detail: err.message });
  }
});

app.get("/patient/files", authMiddleware, async (req, res) => {
  try {
    const files = await MedicalFile.find({ patient: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(files);
  } catch (err) {
    console.error("Patient files fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/patient/files/:id", authMiddleware, async (req, res) => {
  try {
    const file = await MedicalFile.findOne({
      _id: req.params.id,
      patient: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const diskPath = path.join(__dirname, "uploads/medical", file.storedName);

    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    await file.deleteOne();

    res.json({ message: "File deleted" });
  } catch (err) {
    console.error("Patient file delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// DOCTOR ROUTES
// ==========================================

app.get("/doctor/profile", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(doctor);
  } catch (err) {
    console.error("Doctor profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/doctor/profile", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const { name, specialty, experience, bio, phone } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { name, specialty, experience, bio, phone },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", doctor });
  } catch (err) {
    console.error("Doctor profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/doctor/profile/photo",
  authMiddleware,
  doctorMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const photoUrl = `/uploads/profiles/${req.file.filename}`;

      const doctor = await Doctor.findByIdAndUpdate(
        req.user.id,
        { photo: photoUrl },
        { new: true }
      ).select("-password");

      res.json({ message: "Photo updated", photo: doctor.photo });
    } catch (err) {
      console.error("Doctor photo update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get("/doctor/stats", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      unreadMessages,
    ] = await Promise.all([
      Appointment.distinct("patient", { doctor: req.user.id }).then(
        (r) => r.length
      ),
      Appointment.countDocuments({ doctor: req.user.id }),
      Appointment.countDocuments({
        doctor: req.user.id,
        date: { $gte: start, $lte: end },
      }),
      Appointment.countDocuments({ doctor: req.user.id, status: "pending" }),
      Appointment.countDocuments({ doctor: req.user.id, status: "completed" }),
      Message.countDocuments({ receiver: req.user.id, read: false }),
    ]);

    res.json({
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      unreadMessages,
    });
  } catch (err) {
    console.error("Doctor stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/doctor/schedule/today", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const schedule = await Appointment.find({
      doctor: req.user.id,
      date: { $gte: start, $lte: end },
    })
      .populate("patient", "name email phone")
      .sort({ time: 1 });

    res.json(schedule);
  } catch (err) {
    console.error("Doctor schedule today error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/doctor/appointments", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email phone")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("Doctor appointments fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/doctor/appointments/:id", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id },
      { status },
      { new: true }
    ).populate("patient", "name");

    if (!appt) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Updated", appointment: appt });
  } catch (err) {
    console.error("Doctor appointment update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/doctor/patients", authMiddleware, doctorMiddleware, async (req, res) => {
  try {
    const appts = await Appointment.find({ doctor: req.user.id }).populate(
      "patient",
      "name email phone createdAt"
    );

    const seen = new Set();
    const patients = [];

    for (const a of appts) {
      if (a.patient && !seen.has(String(a.patient._id))) {
        seen.add(String(a.patient._id));
        patients.push(a.patient);
      }
    }

    res.json(patients);
  } catch (err) {
    console.error("Doctor patients fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get(
  "/doctor/patients/:patientId/files",
  authMiddleware,
  doctorMiddleware,
  async (req, res) => {
    try {
      const linked = await Appointment.exists({
        doctor: req.user.id,
        patient: req.params.patientId,
      });

      if (!linked) {
        return res.status(403).json({
          message: "This patient is not in your list",
        });
      }

      const files = await MedicalFile.find({
        patient: req.params.patientId,
      }).sort({ createdAt: -1 });

      res.json(files);
    } catch (err) {
      console.error("Doctor patient files fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
// DOCTOR — add a progress entry for a patient
app.post(
  "/doctor/patients/:patientId/progress",
  authMiddleware,
  doctorMiddleware,
  async (req, res) => {
    try {
      const { recoveryPct, note, appointmentId, sessionDate } = req.body;

      if (recoveryPct === undefined || recoveryPct === null) {
        return res.status(400).json({ message: "recoveryPct is required" });
      }

      if (recoveryPct < 0 || recoveryPct > 100) {
        return res.status(400).json({ message: "recoveryPct must be 0–100" });
      }

      // Verify this patient belongs to this doctor
      const linked = await Appointment.exists({
        doctor: req.user.id,
        patient: req.params.patientId,
      });

      if (!linked) {
        return res.status(403).json({ message: "Patient not in your list" });
      }

      const entry = await new Progress({
        patient:     req.params.patientId,
        doctor:      req.user.id,
        appointment: appointmentId || null,
        recoveryPct: Number(recoveryPct),
        note:        note?.trim() || "",
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      }).save();

      await entry.populate("appointment", "date time reason");

      res.status(201).json({ message: "Progress saved", entry });
    } catch (err) {
      console.error("Progress create error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// DOCTOR — get all progress entries for a patient
app.get(
  "/doctor/patients/:patientId/progress",
  authMiddleware,
  doctorMiddleware,
  async (req, res) => {
    try {
      const linked = await Appointment.exists({
        doctor: req.user.id,
        patient: req.params.patientId,
      });

      if (!linked) {
        return res.status(403).json({ message: "Patient not in your list" });
      }

      const entries = await Progress.find({
        patient: req.params.patientId,
        doctor:  req.user.id,
      })
        .populate("appointment", "date time reason")
        .sort({ sessionDate: 1 });

      res.json(entries);
    } catch (err) {
      console.error("Progress fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// DOCTOR — delete a single progress entry
app.delete(
  "/doctor/progress/:entryId",
  authMiddleware,
  doctorMiddleware,
  async (req, res) => {
    try {
      const entry = await Progress.findOneAndDelete({
        _id:    req.params.entryId,
        doctor: req.user.id,
      });

      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Progress delete error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// PATIENT — get own progress (all doctors)
app.get("/patient/progress", authMiddleware, async (req, res) => {
  try {
    const entries = await Progress.find({ patient: req.user.id })
      .populate("doctor",      "name specialty")
      .populate("appointment", "date time reason")
      .sort({ sessionDate: 1 });

    res.json(entries);
  } catch (err) {
    console.error("Patient progress fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// CHAT ROUTES
// ==========================================

app.get("/chat/conversations/list", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name photo role")
      .populate("receiver", "name photo role")
      .sort({ createdAt: -1 });

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;

      const other =
        String(msg.sender._id) === String(req.user.id)
          ? msg.receiver
          : msg.sender;

      if (!seen.has(String(other._id))) {
        seen.add(String(other._id));

        const unread = await Message.countDocuments({
          sender: other._id,
          receiver: req.user.id,
          read: false,
        });

        conversations.push({
          user: other,
          lastMessage: msg.content,
          unread,
          updatedAt: msg.createdAt,
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    console.error("Chat conversations fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/chat/admin/conversations", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id })
      .populate("sender", "name photo role")
      .sort({ createdAt: -1 });

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      if (!msg.sender) continue;

      const id = String(msg.sender._id);

      if (!seen.has(id)) {
        seen.add(id);

        const unread = await Message.countDocuments({
          sender: msg.sender._id,
          receiver: req.user.id,
          read: false,
        });

        conversations.push({
          user: msg.sender,
          lastMessage: msg.content,
          unread,
          time: msg.createdAt,
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    console.error("Admin chat conversations fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/chat/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    console.error("Chat messages fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// CRON JOB — APPOINTMENT REMINDERS
// ==========================================

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
        providerName = doc ? doc.name || doc.email.split("@")[0] : "Doctor";
      }

      const patientEmail = appt.patientEmail;
      const patientName = appt.patientName || "Patient";
      const isLab = appt.serviceType === "home-lab";

      if (patientEmail) {
        const reminderHtml = buildReminderEmail({
          patientName,
          providerName,
          date: appt.date,
          time: appt.time,
          serviceType: appt.serviceType,
          isLab,
        });

        transporter
          .sendMail({
            from: `"Afiya Care" <${process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: "⏰ Reminder: Your AfiyaCare Appointment is Tomorrow",
            html: reminderHtml,
          })
          .catch((err) => console.error("Reminder email error:", err));
      }

      if (appt.patient) {
        io.to(String(appt.patient)).emit("reminder", {
          message: `Reminder: Your ${appt.serviceType?.replace(
            "-",
            " "
          )} appointment with ${providerName} is tomorrow at ${appt.time}.`,
          appointmentId: appt._id,
          time: appt.time,
          date: appt.date,
          providerName,
        });
      }

      appt.reminded = true;
      await appt.save();
    }

    if (upcoming.length > 0) {
      console.log(`Sent ${upcoming.length} reminder(s)`);
    }
  } catch (err) {
    console.error("Cron reminder error:", err);
  }
});



// ==========================================
// SOCKET.IO
// ==========================================

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers.set(String(userId), socket.id);
    socket.join(String(userId));
  });

  socket.on("joinAsAdmin", () => {
    socket.join("admins");
    console.log("Admin joined admins room:", socket.id);
  });

  socket.on("appointmentCancelled", (data) => {
    const { doctorId, ...rest } = data;

    if (doctorId) {
      io.to(String(doctorId)).emit("appointmentCancelled", rest);
    }

    io.to("admins").emit("appointmentCancelled", rest);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    if (!senderId || !receiverId || !content?.trim()) return;

    try {
      const [senderModel, receiverModel] = await Promise.all([
        resolveModel(senderId),
        resolveModel(receiverId),
      ]);

      const message = await Message.create({
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        content: content.trim(),
        read: false,
      });

      await message.populate("sender", "name photo role");

      socket.emit("messageSent", message);
      socket.to(String(receiverId)).emit("receiveMessage", message);
    } catch (err) {
      console.error("sendMessage error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("markRead", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { sender: senderId, receiver: receiverId, read: false },
        { read: true }
      );
    } catch (err) {
      console.error("markRead error:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});




// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

