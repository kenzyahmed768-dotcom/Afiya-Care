import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./style/PatientDashboard.css";
import Logo from "../images/logo.jpeg";

const API = "http://localhost:5000";
let socket;

export default function PatientDashboard() {
  const [activeTab, setActiveTab]         = useState("profile");
  const [patient, setPatient]             = useState(null);
  const [appointments, setAppointments]   = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [chatInput, setChatInput]         = useState("");
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast]                 = useState(null);
  const [editMode, setEditMode]           = useState(false);
  const [form, setForm]                   = useState({ name: "", phone: "" });

  const fileRef       = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate      = useNavigate();

  const token  = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const safeFetch = async (path) => {
    try {
      const res = await fetch(`${API}${path}`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const fetchData = async () => {
    try {
      const [profile, appts, convos] = await Promise.all([
        safeFetch("/patient/profile"),
        safeFetch("/patient/appointments"),
        safeFetch("/chat/conversations/list"),
      ]);
      if (profile) {
        setPatient(profile);
        setForm({ name: profile.name || "", phone: profile.phone || "" });
      }
      setAppointments(Array.isArray(appts) ? appts : []);
      const convoList = Array.isArray(convos) ? convos : [];
      setConversations(convoList);
      setUnreadCount(convoList.reduce((sum, c) => sum + (c.unread || 0), 0));
    } finally {
      setLoading(false);
    }
  };

  // ── Socket.io setup (identical to DoctorDashboard) ──
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
            ? { ...c, lastMessage: msg.content, unread: activeConvo?.user?._id === String(msg.sender?._id || msg.sender) ? 0 : (c.unread || 0) + 1 }
            : c
        )
      );
      setUnreadCount((n) => n + 1);
    });

    socket.on("messageSent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Open conversation ──
  const openConversation = async (convo) => {
    setActiveConvo(convo);
    try {
      const res = await fetch(`${API}/chat/${convo.user._id}`, { headers });
      const msgs = await res.json();
      setMessages(Array.isArray(msgs) ? msgs : []);
      socket.emit("markRead", { senderId: convo.user._id, receiverId: userId });
      setConversations((prev) =>
        prev.map((c) => String(c.user._id) === String(convo.user._id) ? { ...c, unread: 0 } : c)
      );
      setUnreadCount((prev) => Math.max(0, prev - (convo.unread || 0)));
    } catch { showToast("Failed to load messages", "error"); }
  };

  // ── Send message ──
  const sendMessage = () => {
    if (!chatInput.trim() || !activeConvo) return;
    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: activeConvo.user._id,
      content: chatInput.trim(),
    });
    setChatInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Profile save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/patient/profile`, {
        method: "PATCH", headers,
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient || { ...patient, ...form });
        localStorage.setItem("userName", form.name);
        setEditMode(false);
        showToast("Profile updated!");
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch { showToast("Could not connect to server", "error"); }
    finally { setSaving(false); }
  };

  // ── Photo upload ──
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch(`${API}/patient/profile/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPatient(p => ({ ...p, photo: data.photo }));
        showToast("Photo updated!");
      } else {
        showToast(data.message || "Upload failed", "error");
      }
    } catch { showToast("Upload failed", "error"); }
    finally { setUploadingPhoto(false); }
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach(k => localStorage.removeItem(k));
    navigate("/login");
  };

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const fmtTime = (d) => d
    ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const statusColor = (s) => ({ pending: "status-pending", confirmed: "status-confirmed", completed: "status-completed", cancelled: "status-cancelled" }[s] || "");

  if (loading) return (
    <div className="pd-loader">
      <div className="pd-loader-ring" />
      <p>Loading your profile...</p>
    </div>
  );

  const initials = patient?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";

  const tabs = [
    { key: "profile",      label: "👤 My Profile" },
    { key: "appointments", label: `📅 Appointments (${appointments.length})` },
    { key: "chat",         label: `💬 Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
  ];

  return (
    <div className="pd-root">

      {/* ── NAV ── */}
      <nav className="pd-nav">
        <a href="/" className="logo">
          <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
        </a>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="#">About us</a></li>
          <li><a href="/join">Join us</a></li>
          <li><a href="#">Booking</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Blog</a></li>
          <li><button className="pd-nav-logout" onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="pd-hero">
        <div className="pd-hero-content">
          <div className="pd-avatar-wrap">
            <div className="pd-avatar">
              {patient?.photo
                ? <img src={`${API}${patient.photo}`} alt="Profile" />
                : <span>{initials}</span>
              }
            </div>
            <button className="pd-avatar-edit" onClick={() => fileRef.current.click()} disabled={uploadingPhoto} title="Change photo">
              {uploadingPhoto ? "..." : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
          </div>
          <div className="pd-hero-info">
            <h1>{patient?.name || "Patient"}</h1>
            <p>{patient?.email}</p>
            <span className="pd-role-badge">Patient</span>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pd-tabs-bar">
        <div className="pd-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`pd-tab ${activeTab === t.key ? "active" : ""}${t.key === "chat" && unreadCount > 0 ? " pd-tab-unread" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={`pd-content${activeTab === "chat" ? " pd-content-chat" : ""}`}>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="pd-card">
            <div className="pd-card-header">
              <div>
                <h2>Personal Information</h2>
                <p>Manage your account details</p>
              </div>
              {!editMode
                ? <button className="pd-btn pd-btn-outline" onClick={() => setEditMode(true)}>✏️ Edit</button>
                : <div className="pd-header-actions">
                    <button className="pd-btn pd-btn-ghost" onClick={() => { setEditMode(false); setForm({ name: patient.name || "", phone: patient.phone || "" }); }}>Cancel</button>
                    <button className="pd-btn pd-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                  </div>
              }
            </div>
            <div className="pd-fields">
              <div className="pd-field">
                <label>Full Name</label>
                {editMode
                  ? <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                  : <div className="pd-field-value">{patient?.name || "—"}</div>
                }
              </div>
              <div className="pd-field">
                <label>Email Address</label>
                <div className="pd-field-value pd-field-locked">
                  {patient?.email || "—"}
                  <span className="pd-lock-badge">🔒 Cannot be changed</span>
                </div>
              </div>
              <div className="pd-field">
                <label>Phone Number</label>
                {editMode
                  ? <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+20 100 000 0000" />
                  : <div className="pd-field-value">{patient?.phone || <span className="pd-empty">Not provided</span>}</div>
                }
              </div>
              <div className="pd-field">
                <label>Member Since</label>
                <div className="pd-field-value">{fmtDate(patient?.createdAt)}</div>
              </div>
            </div>
            <div className="pd-photo-section">
              <div className="pd-photo-info">
                <h3>Profile Photo</h3>
                <p>Upload a clear photo so your doctors can recognise you easily.</p>
              </div>
              <button className="pd-btn pd-btn-outline" onClick={() => fileRef.current.click()} disabled={uploadingPhoto}>
                {uploadingPhoto ? "Uploading..." : "📷 Change Photo"}
              </button>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ── */}
        {activeTab === "appointments" && (
          <div className="pd-card">
            <div className="pd-card-header">
              <div>
                <h2>Appointment History</h2>
                <p>{appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            {appointments.length === 0 ? (
              <div className="pd-empty-state">
                <span>📅</span>
                <h3>No appointments yet</h3>
                <p>When you book an appointment it will appear here.</p>
                <a href="#" className="pd-btn pd-btn-primary">Book an Appointment</a>
              </div>
            ) : (
              <div className="pd-appt-list">
                {appointments.map(a => (
                  <div className="pd-appt-card" key={a._id}>
                    <div className="pd-appt-avatar">{a.doctor?.name?.charAt(0).toUpperCase() || "D"}</div>
                    <div className="pd-appt-info">
                      <div className="pd-appt-doctor">{a.doctor?.name || "—"}</div>
                      <div className="pd-appt-specialty">{a.doctor?.specialty || "General"}</div>
                      <div className="pd-appt-meta">
                        <span>📅 {fmtDate(a.date)}</span>
                        {a.time && <span>🕐 {a.time}</span>}
                        {a.reason && <span>📋 {a.reason}</span>}
                      </div>
                    </div>
                    <div className="pd-appt-actions">
                      <span className={`pd-status ${statusColor(a.status)}`}>{a.status}</span>
                      {a.status === "confirmed" && (
                        <button
                          className="pd-btn pd-btn-outline pd-btn-sm"
                          onClick={() => {
                            const convo = conversations.find(c => String(c.user._id) === String(a.doctor?._id));
                            setActiveTab("chat");
                            if (convo) openConversation(convo);
                            else { setActiveConvo({ user: a.doctor }); setMessages([]); }
                          }}
                        >
                          💬 Message Doctor
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {activeTab === "chat" && (
          <div className="pd-chat-layout">

            {/* Conversations sidebar */}
            <div className="pd-chat-sidebar">
              <div className="pd-chat-sidebar-header">
                <div className="pd-chat-sidebar-title">💬 My Doctors</div>
              </div>
              <div className="pd-chat-conversations">
                {conversations.length === 0 ? (
                  <div className="pd-chat-empty-convos">
                    <span>👨‍⚕️</span>
                    <p>No conversations yet.<br />Message a doctor from your appointments.</p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.user._id}
                      className={`pd-convo-item ${activeConvo?.user?._id === c.user._id ? "active" : ""}`}
                      onClick={() => openConversation(c)}
                    >
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

            {/* Chat window */}
            <div className="pd-chat-main">
              {!activeConvo ? (
                <div className="pd-chat-no-select">
                  <span>💬</span>
                  <p>Select a doctor to start chatting</p>
                </div>
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
                      <div className="pd-chat-empty">
                        <span>👋</span>
                        <p>Say hello to your doctor!</p>
                      </div>
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
                    <input
                      className="pd-chat-input"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button className="pd-chat-send-btn" onClick={sendMessage}>➤</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {toast && <div className={`pd-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}