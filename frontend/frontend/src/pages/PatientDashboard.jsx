import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Logo from "../images/logo.jpeg";
import "../style/PatientDashboard.css";

const API = "http://localhost:5000";
let socket;

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [logoFailed, setLogoFailed] = useState(false);

  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });

  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "", doctorId: "", appointmentId: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [completedAppointmentsList, setCompletedAppointmentsList] = useState([]);

  const [medicalFiles, setMedicalFiles] = useState([]);
  const [uploadingMedical, setUploadingMedical] = useState(false);
  const [medicalLabel, setMedicalLabel] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);

  // ── Progress state ────────────────────────────────────────
  const [progressEntries, setProgressEntries] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const fileRef        = useRef(null);
  const medicalFileRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const token  = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const authHeader  = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const safeFetch = async (path) => {
    try {
      const res = await fetch(`${API}${path}`, { headers: jsonHeaders });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const fetchMedicalFiles = async () => {
    const files = await safeFetch("/patient/files");
    setMedicalFiles(Array.isArray(files) ? files : []);
  };

  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {
      const data = await safeFetch("/patient/progress");
      setProgressEntries(Array.isArray(data) ? data : []);
    } finally { setLoadingProgress(false); }
  };

  const fetchData = async () => {
    try {
      const [profile, appts, convos, reviewsData, filesData, progressData] = await Promise.all([
        safeFetch("/patient/profile"),
        safeFetch("/patient/appointments"),
        safeFetch("/chat/conversations/list"),
        safeFetch("/patient/reviews"),
        safeFetch("/patient/files"),
        safeFetch("/patient/progress"),
      ]);

      if (profile) {
        setPatient(profile);
        setForm({ name: profile.name || "", phone: profile.phone || "" });
      }

      const apptsList = Array.isArray(appts) ? appts : [];
      setAppointments(apptsList);
      setCompletedAppointmentsList(apptsList.filter((a) => a.status === "completed"));

      const now = new Date();
      setStats({
        totalAppointments:     apptsList.length,
        upcomingAppointments:  apptsList.filter((a) => new Date(a.date) >= now && a.status !== "cancelled").length,
        completedAppointments: apptsList.filter((a) => a.status === "completed").length,
      });

      const convoList = Array.isArray(convos) ? convos : [];
      setConversations(convoList);
      setUnreadCount(convoList.reduce((sum, c) => sum + (c.unread || 0), 0));

      setReviews(Array.isArray(reviewsData)  ? reviewsData  : []);
      setMedicalFiles(Array.isArray(filesData) ? filesData : []);
      setProgressEntries(Array.isArray(progressData) ? progressData : []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
    socket = io(API);
    socket.emit("join", userId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(msg.sender?._id || msg.sender)
            ? { ...c, lastMessage: msg.content, unread: (c.unread || 0) + 1 }
            : c
        )
      );
      setUnreadCount((n) => n + 1);
    });

    socket.on("messageSent", (msg) => setMessages((prev) => [...prev, msg]));
    return () => { if (socket) socket.disconnect(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reload progress when switching to that tab
  useEffect(() => {
    if (activeTab === "progress" && progressEntries.length === 0 && !loadingProgress) {
      fetchProgress();
    }
  }, [activeTab]);

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    try {
      const res  = await fetch(`${API}/chat/${convo.user._id}`, { headers: jsonHeaders });
      const msgs = await res.json();
      setMessages(Array.isArray(msgs) ? msgs : []);
      socket.emit("markRead", { senderId: convo.user._id, receiverId: userId });
      setConversations((prev) =>
        prev.map((c) => String(c.user._id) === String(convo.user._id) ? { ...c, unread: 0 } : c)
      );
      setUnreadCount((prev) => Math.max(0, prev - (convo.unread || 0)));
    } catch { showToast("Failed to load messages", "error"); }
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !activeConvo) return;
    socket.emit("sendMessage", { senderId: userId, receiverId: activeConvo.user._id, content: chatInput.trim() });
    setChatInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/patient/profile`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ name: form.name, phone: form.phone }) });
      const data = await res.json();
      if (res.ok) { setPatient(data.patient || { ...patient, ...form }); localStorage.setItem("userName", form.name); showToast("Profile updated!"); }
      else showToast(data.message || "Update failed", "error");
    } catch { showToast("Could not connect to server", "error"); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res  = await fetch(`${API}/patient/profile/photo`, { method: "POST", headers: authHeader, body: formData });
      const data = await res.json();
      if (res.ok) { setPatient((p) => ({ ...p, photo: data.photo })); showToast("Photo updated!"); }
      else showToast(data.message || "Upload failed", "error");
    } catch { showToast("Upload failed", "error"); }
    finally { setUploadingPhoto(false); }
  };

  const handleFileSelect = (e) => setSelectedFiles(Array.from(e.target.files || []));

  const handleMedicalUpload = async () => {
    if (selectedFiles.length === 0) { showToast("Please select at least one file first", "error"); return; }
    setUploadingMedical(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("labels", JSON.stringify(selectedFiles.map(() => medicalLabel.trim() || "")));
      const res  = await fetch(`${API}/patient/files`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Server error (${res.status})`); }
      if (res.ok) {
        showToast(`${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} uploaded!`);
        setMedicalLabel(""); setSelectedFiles([]);
        if (medicalFileRef.current) medicalFileRef.current.value = "";
        await fetchMedicalFiles();
      } else showToast(data?.message || `Upload failed (${res.status})`, "error");
    } catch (err) { showToast(err.message || "Could not upload files", "error"); }
    finally { setUploadingMedical(false); }
  };

  const handleDeleteMedicalFile = async (id) => {
    if (!window.confirm("Delete this medical file?")) return;
    try {
      const res  = await fetch(`${API}/patient/files/${id}`, { method: "DELETE", headers: authHeader });
      const data = await res.json();
      if (res.ok) { showToast("File deleted"); setMedicalFiles((prev) => prev.filter((f) => f._id !== id)); }
      else showToast(data.message || "Delete failed", "error");
    } catch { showToast("Could not delete file", "error"); }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancellingId(id);
    try {
      const res  = await fetch(`${API}/patient/appointments/${id}/cancel`, { method: "PATCH", headers: authHeader });
      const data = await res.json();
      if (res.ok) { showToast("Appointment cancelled"); setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "cancelled" } : a)); }
      else showToast(data.message || "Could not cancel", "error");
    } catch { showToast("Could not connect to server", "error"); }
    finally { setCancellingId(null); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating || !reviewForm.comment) { showToast("Please provide a rating and comment", "error"); return; }
    setSubmittingReview(true);
    try {
      const res  = await fetch(`${API}/patient/reviews`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(reviewForm) });
      const data = await res.json();
      if (res.ok) {
        showToast("Thank you for your review!");
        setReviews((prev) => [data.review, ...prev]);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: "", comment: "", doctorId: "", appointmentId: "" });
      } else showToast(data.message || "Failed to submit review", "error");
    } catch { showToast("Could not connect to server", "error"); }
    finally { setSubmittingReview(false); }
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach((k) => localStorage.removeItem(k));
    navigate("/login");
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "---";

  const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  const formatFileSize = (bytes) => {
    if (!bytes) return "---";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimetype = "", filename = "") => {
    const lower = filename.toLowerCase();
    if (mimetype.includes("image") || /\.(jpg|jpeg|png|webp)$/i.test(lower)) return "🖼️";
    if (mimetype.includes("pdf") || lower.endsWith(".pdf")) return "📄";
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "📝";
    if (lower.endsWith(".txt")) return "📃";
    return "📁";
  };

  const getProviderName = (a) => {
    if (!a) return "Provider";
    return a.providerName || a.doctorName || a.doctor?.name || a.labName || a.lab?.name || a.provider?.name || "Provider";
  };

  const getProviderInitial = (a) => getProviderName(a).charAt(0).toUpperCase();

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  // ── Progress helpers ──────────────────────────────────────
  const recoveryColor = (pct) => {
    if (pct >= 70) return "#22c55e";
    if (pct >= 40) return "#f59e0b";
    return "#ef4444";
  };

  // Group entries by doctor
  const progressByDoctor = progressEntries.reduce((acc, e) => {
    const key = e.doctor?._id || "unknown";
    if (!acc[key]) acc[key] = { doctor: e.doctor, entries: [] };
    acc[key].entries.push(e);
    return acc;
  }, {});

  const latestRecovery = progressEntries.length
    ? progressEntries[progressEntries.length - 1].recoveryPct
    : null;

  if (loading) {
    return (
      <div className="pd-loader">
        <div className="pd-loader-ring" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const initials =
    patient?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "P";

  const navItems = [
    { key: "overview",     icon: "📊", label: "Overview" },
    { key: "appointments", icon: "📅", label: `Appointments (${appointments.length})` },
    { key: "progress",     icon: "📈", label: "My Progress" },
    { key: "medical",      icon: "📁", label: `Medical Files (${medicalFiles.length})` },
    { key: "chat",         icon: "💬", label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "reviews",      icon: "⭐", label: "Reviews" },
    { key: "profile",      icon: "👤", label: "Profile" },
  ];

  return (
    <div className="pd-root">
      <aside className="pd-sidebar">
        <div className="pd-sidebar-top" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <div className="pd-sidebar-brand">
            <div className="pd-logo-box" aria-label="Afiya Care logo">
              {!logoFailed ? (
                <img src={Logo} alt="Afiya Care" className="pd-sidebar-logo" onError={() => setLogoFailed(true)} />
              ) : (
                <span className="pd-logo-fallback">AC</span>
              )}
            </div>
            <div className="pd-brand-text"><h2>Afiya Care</h2><span>Patient Portal</span></div>
          </div>
        </div>

        <div className="pd-sidebar-body">
          <span className="pd-nav-section-label">Menu</span>
          {navItems.map(({ key, icon, label }) => (
            <button key={key} className={`pd-nav-item ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
              <span className="pd-nav-icon">{icon}</span>
              <span className="pd-nav-text">{label}</span>
              {key === "chat" && unreadCount > 0 && <span className="pd-nav-badge">{unreadCount}</span>}
            </button>
          ))}
        </div>

        <div className="pd-sidebar-footer">
          <button className="pd-logout-btn" onClick={handleLogout}>
            <span className="pd-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="pd-main-content">
        <div className="pd-topbar">
          <div className="pd-topbar-left">
            <h1>{navItems.find((n) => n.key === activeTab)?.label || "Dashboard"}</h1>
            <p>Welcome back, {patient?.name?.split(" ")[0] || "Patient"}</p>
          </div>
          <div className="pd-user-pill">
            <div className="pd-user-avatar">{initials}</div>
            <span>Patient</span>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div className="pd-stats-grid">
              {[
                { icon: "📅", color: "blue",   val: stats.totalAppointments,     label: "Total Appointments" },
                { icon: "⏰", color: "green",  val: stats.upcomingAppointments,  label: "Upcoming" },
                { icon: "✅", color: "purple", val: stats.completedAppointments, label: "Completed" },
                { icon: "📈", color: "amber",  val: latestRecovery !== null ? `${latestRecovery}%` : "—", label: "Latest Recovery" },
              ].map(({ icon, color, val, label }) => (
                <div className="pd-stat-card" key={label}>
                  <div className={`pd-stat-icon-box ${color}`}>{icon}</div>
                  <div>
                    <div className="pd-stat-value">{val}</div>
                    <div className="pd-stat-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress snapshot on overview */}
            {progressEntries.length > 0 && (
              <div className="pd-section-card" style={{ marginBottom: "20px" }}>
                <div className="pd-section-header">
                  <div>
                    <div className="pd-section-title">Recovery Snapshot</div>
                    <div className="pd-section-sub">Your latest progress across all sessions</div>
                  </div>
                  <button className="pd-btn pd-btn-primary" onClick={() => setActiveTab("progress")}>
                    View Full Progress
                  </button>
                </div>
                <div className="pd-progress-snapshot">
                  {progressEntries.slice(-6).map((e, i) => (
                    <div className="pd-progress-snap-item" key={e._id}>
                      <div
                        className="pd-progress-snap-ring"
                        style={{ background: `conic-gradient(${recoveryColor(e.recoveryPct)} ${e.recoveryPct}%, #e2e8f0 0)` }}
                      >
                        <span>{e.recoveryPct}%</span>
                      </div>
                      <div className="pd-progress-snap-date">{fmtDate(e.sessionDate)}</div>
                      <div className="pd-progress-snap-doc">Dr. {e.doctor?.name?.split(" ").pop()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-section-card">
              <div className="pd-section-header">
                <div>
                  <div className="pd-section-title">Upcoming Appointments</div>
                  <div className="pd-section-sub">Your next scheduled sessions</div>
                </div>
                <button className="pd-btn pd-btn-primary" onClick={() => navigate("/booking")}>Book New</button>
              </div>
              {appointments.filter((a) => new Date(a.date) >= new Date() && a.status !== "cancelled").length === 0 ? (
                <div className="pd-empty-state"><span className="pd-empty-icon">📅</span><p>No upcoming appointments</p></div>
              ) : (
                appointments.filter((a) => new Date(a.date) >= new Date() && a.status !== "cancelled").slice(0, 5).map((a) => (
                  <div className="pd-appointment-item" key={a._id}>
                    <div className="pd-appointment-time">{a.time}</div>
                    <div className="pd-avatar green">{getProviderInitial(a)}</div>
                    <div className="pd-appointment-info">
                      <div className="pd-appointment-name">{getProviderName(a)}</div>
                      <div className="pd-appointment-reason">{a.reason || "General Consultation"}</div>
                    </div>
                    <span className={`pd-pill ${a.status}`}>{a.status}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── APPOINTMENTS ── */}
        {activeTab === "appointments" && (
          <div className="pd-section-card">
            <div className="pd-section-header">
              <div><div className="pd-section-title">All Appointments</div><div className="pd-section-sub">{appointments.length} total</div></div>
              <button className="pd-btn pd-btn-primary" onClick={() => navigate("/booking")}>Book New</button>
            </div>
            {appointments.length === 0 ? (
              <div className="pd-empty-state">
                <span className="pd-empty-icon">📅</span>
                <p>No appointments yet</p>
                <button className="pd-btn pd-btn-primary" onClick={() => navigate("/booking")}>Book Your First Appointment</button>
              </div>
            ) : (
              <table className="pd-data-table">
                <thead><tr><th>Provider</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id}>
                      <td><div className="pd-cell-name"><div className="pd-avatar green">{getProviderInitial(a)}</div>{getProviderName(a)}</div></td>
                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "---"}</td>
                      <td>{a.reason || "---"}</td>
                      <td><span className={`pd-pill ${a.status}`}>{a.status}</span></td>
                      <td>
                        <div className="pd-table-actions">
                          {a.status === "confirmed" && a.doctor?._id && (
                            <button className="pd-btn pd-btn-primary pd-btn-sm" onClick={() => {
                              const convo = conversations.find((c) => String(c.user._id) === String(a.doctor._id));
                              setActiveTab("chat");
                              if (convo) openConversation(convo);
                              else { setActiveConvo({ user: a.doctor }); setMessages([]); }
                            }}>💬 Message</button>
                          )}
                          {["pending", "confirmed"].includes(a.status) && (
                            <button className="pd-btn pd-btn-danger pd-btn-sm" disabled={cancellingId === a._id} onClick={() => handleCancelAppointment(a._id)}>
                              {cancellingId === a._id ? "Cancelling…" : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── MY PROGRESS ── */}
        {activeTab === "progress" && (
          <div className="pd-section-card">
            <div className="pd-section-header">
              <div>
                <div className="pd-section-title">My Recovery Progress</div>
                <div className="pd-section-sub">Tracked by your doctors across all sessions</div>
              </div>
              <button className="pd-btn pd-btn-primary" onClick={fetchProgress} disabled={loadingProgress}>
                {loadingProgress ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>

            {loadingProgress ? (
              <div className="pd-empty-state"><div className="pd-loader-ring" /><p>Loading progress…</p></div>
            ) : progressEntries.length === 0 ? (
              <div className="pd-empty-state">
                <span className="pd-empty-icon">📈</span>
                <p>No progress entries yet.</p>
                <p style={{ fontSize: "12px", color: "var(--pd-text-light)" }}>Your doctor will add entries after each session.</p>
              </div>
            ) : (
              <>
                {/* Overall summary */}
                <div className="pd-progress-summary-row">
                  <div className="pd-progress-summary-card">
                    <span>Total Sessions</span>
                    <strong>{progressEntries.length}</strong>
                  </div>
                  <div className="pd-progress-summary-card">
                    <span>Latest Recovery</span>
                    <strong style={{ color: recoveryColor(latestRecovery) }}>{latestRecovery}%</strong>
                  </div>
                  <div className="pd-progress-summary-card">
                    <span>First Session</span>
                    <strong>{fmtDate(progressEntries[0]?.sessionDate)}</strong>
                  </div>
                  <div className="pd-progress-summary-card">
                    <span>Last Session</span>
                    <strong>{fmtDate(progressEntries[progressEntries.length - 1]?.sessionDate)}</strong>
                  </div>
                </div>

                {/* Overall bar chart */}
                <div className="pd-progress-chart-wrap">
                  <div className="pd-progress-chart-title">Recovery Timeline — All Sessions</div>
                  <div className="pd-progress-chart-bars">
                    {progressEntries.map((e, i) => (
                      <div className="pd-progress-chart-col" key={e._id}>
                        <span className="pd-progress-chart-pct">{e.recoveryPct}%</span>
                        <div className="pd-progress-chart-bar-wrap">
                          <div
                            className="pd-progress-chart-bar-fill"
                            style={{ height: `${e.recoveryPct}%`, background: recoveryColor(e.recoveryPct) }}
                          />
                        </div>
                        <span className="pd-progress-chart-label">S{i + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pd-progress-chart-legend">
                    <span style={{ color: "#ef4444" }}>● Needs work (0–39%)</span>
                    <span style={{ color: "#f59e0b" }}>● Improving (40–69%)</span>
                    <span style={{ color: "#22c55e" }}>● Good recovery (70–100%)</span>
                  </div>
                </div>

                {/* Per-doctor sections */}
                {Object.values(progressByDoctor).map(({ doctor, entries }) => (
                  <div key={doctor?._id || "unknown"} className="pd-progress-doctor-section">
                    <div className="pd-progress-doctor-header">
                      <div className="pd-avatar green">{doctor?.name?.charAt(0).toUpperCase() || "?"}</div>
                      <div>
                        <div className="pd-progress-doctor-name">Dr. {doctor?.name || "Unknown"}</div>
                        <div className="pd-progress-doctor-spec">{doctor?.specialty || ""}</div>
                      </div>
                      <div className="pd-progress-doctor-badge" style={{ color: recoveryColor(entries[entries.length - 1]?.recoveryPct) }}>
                        Latest: {entries[entries.length - 1]?.recoveryPct}%
                      </div>
                    </div>

                    <div className="pd-progress-entries">
                      {[...entries].reverse().map((e) => (
                        <div className="pd-progress-entry" key={e._id}>
                          <div
                            className="pd-progress-entry-ring"
                            style={{ background: `conic-gradient(${recoveryColor(e.recoveryPct)} ${e.recoveryPct}%, #e2e8f0 0)` }}
                          >
                            <span>{e.recoveryPct}%</span>
                          </div>
                          <div className="pd-progress-entry-body">
                            <div className="pd-progress-entry-date">{fmtDate(e.sessionDate)}</div>
                            {e.note && <p className="pd-progress-entry-note">"{e.note}"</p>}
                            {e.appointment && (
                              <div className="pd-progress-entry-appt">
                                📅 Session: {fmtDate(e.appointment.date)}{e.appointment.time ? ` at ${e.appointment.time}` : ""}
                              </div>
                            )}
                          </div>
                          <div className="pd-progress-entry-bar">
                            <div className="pd-progress-entry-bar-track">
                              <div
                                className="pd-progress-entry-bar-fill"
                                style={{ width: `${e.recoveryPct}%`, background: recoveryColor(e.recoveryPct) }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── MEDICAL FILES ── */}
        {activeTab === "medical" && (
          <div className="pd-section-card">
            <div className="pd-section-header">
              <div>
                <div className="pd-section-title">Medical Files</div>
                <div className="pd-section-sub">Upload reports, prescriptions, scans, or documents for your doctors.</div>
              </div>
            </div>
            <div className="pd-medical-upload-area">
              <div className="pd-form-grid">
                <div className="pd-form-group">
                  <label className="pd-form-label">File Label / Note</label>
                  <input className="pd-form-input" value={medicalLabel} onChange={(e) => setMedicalLabel(e.target.value)} placeholder="e.g. MRI report, blood test, prescription" disabled={uploadingMedical} />
                </div>
                <div className="pd-form-group">
                  <label className="pd-form-label">Choose Files</label>
                  <input ref={medicalFileRef} className="pd-form-input" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} disabled={uploadingMedical} />
                  {selectedFiles.length > 0 && (
                    <p className="pd-file-selected-hint">{selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected: {selectedFiles.map((f) => f.name).join(", ")}</p>
                  )}
                </div>
              </div>
              <button className="pd-btn pd-btn-primary pd-medical-upload-btn" type="button" onClick={handleMedicalUpload} disabled={uploadingMedical || selectedFiles.length === 0}>
                {uploadingMedical ? "Uploading…" : selectedFiles.length > 0 ? `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}` : "Select Files First"}
              </button>
            </div>
            {medicalFiles.length === 0 ? (
              <div className="pd-empty-state"><span className="pd-empty-icon">📁</span><p>No medical files uploaded yet</p></div>
            ) : (
              <table className="pd-data-table">
                <thead><tr><th>File</th><th>Label</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
                <tbody>
                  {medicalFiles.map((file) => (
                    <tr key={file._id}>
                      <td><div className="pd-cell-name"><div className="pd-avatar blue">{getFileIcon(file.mimetype, file.filename)}</div>{file.filename}</div></td>
                      <td>{file.label || "---"}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>{fmtDate(file.createdAt)}</td>
                      <td>
                        <div className="pd-table-actions">
                          <a className="pd-btn pd-btn-primary pd-btn-sm" href={`${API}${file.url}`} target="_blank" rel="noreferrer">Open</a>
                          <button className="pd-btn pd-btn-outline pd-btn-sm" onClick={() => handleDeleteMedicalFile(file._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── CHAT ── */}
        {activeTab === "chat" && (
          <div className="pd-chat-layout">
            <div className="pd-chat-sidebar">
              <div className="pd-chat-sidebar-header"><div className="pd-chat-sidebar-title">💬 My Doctors</div></div>
              <div className="pd-chat-conversations">
                {conversations.length === 0 ? (
                  <div className="pd-chat-empty-convos"><span>👨‍⚕️</span><p>No conversations yet.<br />Message a doctor from your appointments.</p></div>
                ) : (
                  conversations.map((c) => (
                    <div key={c.user._id} className={`pd-convo-item ${activeConvo?.user?._id === c.user._id ? "active" : ""}`} onClick={() => openConversation(c)}>
                      <div className="pd-convo-avatar">{c.user?.name?.charAt(0).toUpperCase()}</div>
                      <div className="pd-convo-info">
                        <div className="pd-convo-name">{c.user?.name}</div>
                        <div className="pd-convo-last">{c.lastMessage || "Start a conversation"}</div>
                      </div>
                      {c.unread > 0 && <span className="pd-convo-unread">{c.unread}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pd-chat-main">
              {!activeConvo ? (
                <div className="pd-chat-no-select"><span>💬</span><p>Select a doctor to start chatting</p></div>
              ) : (
                <>
                  <div className="pd-chat-header">
                    <div className="pd-convo-avatar">{activeConvo.user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="pd-chat-header-name">{activeConvo.user?.name}</div>
                      <div className="pd-chat-header-sub">{activeConvo.user?.specialty || "Doctor"}</div>
                    </div>
                  </div>
                  <div className="pd-chat-messages">
                    {messages.length === 0 ? (
                      <div className="pd-chat-empty"><span>👋</span><p>Say hello to your doctor!</p></div>
                    ) : (
                      messages.map((msg, i) => {
                        const isSent = String(msg.sender?._id || msg.sender) === userId;
                        return (
                          <div key={i} className={`pd-msg ${isSent ? "sent" : "received"}`}>
                            <div className="pd-msg-bubble">{msg.content}</div>
                            <div className="pd-msg-time">{fmtTime(msg.createdAt)}</div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="pd-chat-input-bar">
                    <input className="pd-chat-input" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown} />
                    <button className="pd-chat-send-btn" onClick={sendMessage}>➤</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === "reviews" && (
          <div className="pd-reviews-container">
            <div className="pd-section-card">
              <div className="pd-section-header">
                <div><div className="pd-section-title">My Reviews</div><div className="pd-section-sub">Share your experience with us</div></div>
                {!showReviewForm && <button className="pd-btn pd-btn-primary" onClick={() => setShowReviewForm(true)}>✏️ Write a Review</button>}
              </div>
              {showReviewForm && (
                <div className="pd-review-form-container">
                  <form className="pd-review-form" onSubmit={handleSubmitReview}>
                    <h3>Share Your Feedback</h3>
                    <p>We&apos;d love to hear about your experience!</p>
                    <div className="pd-form-group">
                      <label className="pd-form-label">Select Appointment (Optional)</label>
                      <select className="pd-form-select" value={reviewForm.appointmentId} onChange={(e) => {
                        const appt = completedAppointmentsList.find((a) => a._id === e.target.value);
                        setReviewForm({ ...reviewForm, appointmentId: e.target.value, doctorId: appt?.doctor?._id || "" });
                      }}>
                        <option value="">General Feedback</option>
                        {completedAppointmentsList.map((a) => (
                          <option key={a._id} value={a._id}>{fmtDate(a.date)} with {getProviderName(a)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pd-form-group">
                      <label className="pd-form-label">Rating *</label>
                      <div className="pd-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" className={`pd-star-btn ${reviewForm.rating >= star ? "active" : ""}`} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>★</button>
                        ))}
                      </div>
                    </div>
                    <div className="pd-form-group">
                      <label className="pd-form-label">Title (Optional)</label>
                      <input type="text" className="pd-form-input" placeholder="e.g., Great experience!" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
                    </div>
                    <div className="pd-form-group">
                      <label className="pd-form-label">Your Review *</label>
                      <textarea className="pd-form-textarea" rows={4} placeholder="Tell us about your experience with Afiya Care..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
                    </div>
                    <div className="pd-form-actions">
                      <button type="button" className="pd-btn pd-btn-outline" onClick={() => { setShowReviewForm(false); setReviewForm({ rating: 5, title: "", comment: "", doctorId: "", appointmentId: "" }); }}>Cancel</button>
                      <button type="submit" className="pd-btn pd-btn-primary" disabled={submittingReview}>{submittingReview ? "Submitting..." : "Submit Review"}</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="pd-reviews-list">
                {reviews.length === 0 ? (
                  <div className="pd-empty-state">
                    <span className="pd-empty-icon">⭐</span>
                    <p>No reviews yet</p>
                    <button className="pd-btn pd-btn-primary" onClick={() => setShowReviewForm(true)}>Write Your First Review</button>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div className="pd-review-item" key={review._id || index}>
                      <div className="pd-review-header">
                        <div className="pd-reviewer-info">
                          <div className="pd-reviewer-avatar">{review.patient?.name?.charAt(0).toUpperCase() || initials}</div>
                          <div>
                            <div className="pd-reviewer-name">{review.patient?.name || patient?.name || "You"}</div>
                            <div className="pd-review-date">{fmtDate(review.createdAt)}</div>
                          </div>
                        </div>
                        <div className="pd-review-rating"><span className="pd-stars-display">{renderStars(review.rating)}</span></div>
                      </div>
                      {review.title && <h4 className="pd-review-title">{review.title}</h4>}
                      <p className="pd-review-comment">{review.comment}</p>
                      {review.doctor && <div className="pd-review-doctor">👨‍⚕️ Doctor: Dr. {review.doctor.name}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="pd-profile-layout">
            <div className="pd-profile-photo-card">
              <div className="pd-photo-wrap">
                {patient?.photo ? (
                  <img src={`${API}${patient.photo}`} alt="Profile" className="pd-profile-photo" />
                ) : (
                  <div className="pd-photo-initials">{initials}</div>
                )}
                <button className="pd-photo-upload-btn" onClick={() => fileRef.current.click()} disabled={uploadingPhoto}>✎</button>
                <input ref={fileRef} type="file" accept="image/*" className="pd-hidden-input" onChange={handlePhotoUpload} />
              </div>
              <div className="pd-profile-name">{patient?.name}</div>
              <div className="pd-profile-role">Patient</div>
              {uploadingPhoto && <p className="pd-uploading-text">Uploading...</p>}
              <div className="pd-full-width">
                {[
                  ["Email",        patient?.email],
                  ["Phone",        patient?.phone || "---"],
                  ["Member Since", fmtDate(patient?.createdAt)],
                  ["Appointments", stats.totalAppointments],
                ].map(([label, val]) => (
                  <div className="pd-profile-stat" key={label}><span>{label}</span><span>{val}</span></div>
                ))}
              </div>
            </div>
            <div className="pd-profile-form-card">
              <div className="pd-section-header">
                <div><div className="pd-section-title">Edit Profile</div><div className="pd-section-sub">Update your information</div></div>
                <button className="pd-btn pd-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
              <div className="pd-form-grid pd-profile-form-grid">
                <div className="pd-form-group">
                  <label className="pd-form-label">Full Name</label>
                  <input className="pd-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="pd-form-group">
                  <label className="pd-form-label">Phone</label>
                  <input className="pd-form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+20 100 000 0000" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && <div className={`pd-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}