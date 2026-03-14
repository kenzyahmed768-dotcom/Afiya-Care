import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./DoctorDashboard.css";

const API = "http://localhost:5000";
let socket;

export default function DoctorDashboard() {
  const [activeTab, setActiveTab]         = useState("overview");
  const [profile, setProfile]             = useState(null);
  const [stats, setStats]                 = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [appointments, setAppointments]   = useState([]);
  const [patients, setPatients]           = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [chatInput, setChatInput]         = useState("");
  const [loading, setLoading]             = useState(true);
  const [toast, setToast]                 = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [photoFile, setPhotoFile]         = useState(null);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  const token   = localStorage.getItem("token");
  const userId  = JSON.parse(atob(token.split(".")[1])).id;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const get = async (path) => {
    const res = await fetch(`${API}${path}`, { headers });
    return res.json();
  };

  // Fetch all data
  const fetchAll = async () => {
    try {
      const [prof, st, today, appts, pats, convos] = await Promise.all([
        get("/doctor/profile"),
        get("/doctor/stats"),
        get("/doctor/schedule/today"),
        get("/doctor/appointments"),
        get("/doctor/patients"),
        get("/chat/conversations/list"),
      ]);
      setProfile(prof);
      setEditForm({
        name: prof.name || "", specialty: prof.specialty || "",
        experience: prof.experience || "", bio: prof.bio || "", phone: prof.phone || "",
      });
      setStats(st);
      setTodaySchedule(Array.isArray(today) ? today : []);
      setAppointments(Array.isArray(appts) ? appts : []);
      setPatients(Array.isArray(pats) ? pats : []);
      setConversations(Array.isArray(convos) ? convos : []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Socket.io setup
  useEffect(() => {
    fetchAll();

    socket = io(API);
    socket.emit("join", userId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(msg.sender._id || msg.sender)
            ? { ...c, lastMessage: msg.content, unread: activeConvo === String(msg.sender._id || msg.sender) ? 0 : c.unread + 1 }
            : c
        )
      );
    });

    socket.on("messageSent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when conversation selected
  const openConversation = async (convo) => {
    setActiveConvo(convo);
    try {
      const msgs = await get(`/chat/${convo.user._id}`);
      setMessages(Array.isArray(msgs) ? msgs : []);
      socket.emit("markRead", { senderId: convo.user._id, receiverId: userId });
      setConversations((prev) =>
        prev.map((c) => String(c.user._id) === String(convo.user._id) ? { ...c, unread: 0 } : c)
      );
    } catch { showToast("Failed to load messages", "error"); }
  };

  // Send message
  const sendMessage = () => {
    if (!chatInput.trim() || !activeConvo) return;
    socket.emit("sendMessage", {
      senderId: userId, receiverId: activeConvo.user._id, content: chatInput.trim(),
    });
    setChatInput("");
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // Appointment status update
  const updateAppt = async (id, status) => {
    try {
      const res = await fetch(`${API}/doctor/appointments/${id}`, {
        method: "PATCH", headers, body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) { showToast("Appointment updated"); fetchAll(); }
      else showToast(data.message, "error");
    } catch { showToast("Failed to update", "error"); }
  };

  // Save profile
  const saveProfile = async () => {
    try {
      const res = await fetch(`${API}/doctor/profile`, {
        method: "PATCH", headers, body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) { showToast("Profile updated"); setProfile(data.doctor); }
      else showToast(data.message, "error");
    } catch { showToast("Failed to save profile", "error"); }
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!photoFile) return;
    const formData = new FormData();
    formData.append("photo", photoFile);
    try {
      const res = await fetch(`${API}/doctor/profile/photo`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json();
      if (res.ok) { showToast("Photo updated"); setProfile((p) => ({ ...p, photo: data.photo })); setPhotoFile(null); setPhotoPreview(null); }
      else showToast(data.message, "error");
    } catch { showToast("Upload failed", "error"); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("role");
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="loader-screen">
      <div className="loader-ring"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  const navItems = [
    { key: "overview",      icon: "📊", label: "Overview" },
    { key: "schedule",      icon: "🗓️", label: "Today's Schedule" },
    { key: "appointments",  icon: "📅", label: "Appointments" },
    { key: "patients",      icon: "🧑‍🦯", label: "My Patients" },
    { key: "chat",          icon: "💬", label: "Chat", badge: stats?.unreadMessages },
    { key: "profile",       icon: "👤", label: "Profile" },
  ];

  return (
    <div className="doctor-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">🏥</div>
            <div className="brand-text">
              <h2>Afiya Care</h2>
              <span>Doctor Portal</span>
            </div>
          </div>
        </div>

        <div className="sidebar-body">
          <span className="nav-section-label">Menu</span>
          {navItems.map(({ key, icon, label, badge }) => (
            <button
              key={key}
              className={`nav-item ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-text">{label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>
              {navItems.find((n) => n.key === activeTab)?.label}
            </h1>
            <p>Welcome back, Dr. {profile?.name?.split(" ")[0]}</p>
          </div>
          <div className="doctor-pill">Doctor</div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">🧑‍🦯</div>
                <div><div className="stat-value">{stats?.totalPatients ?? 0}</div><div className="stat-label">Total Patients</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box green">📅</div>
                <div><div className="stat-value">{stats?.totalAppointments ?? 0}</div><div className="stat-label">Total Appointments</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box amber">⏳</div>
                <div><div className="stat-value">{stats?.todayAppointments ?? 0}</div><div className="stat-label">Today's Schedule</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box purple">💬</div>
                <div><div className="stat-value">{stats?.unreadMessages ?? 0}</div><div className="stat-label">Unread Messages</div></div>
              </div>
            </div>

            {/* Today's schedule preview */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <div className="section-title">Today's Schedule</div>
                  <div className="section-sub">{todaySchedule.length} appointment(s)</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("schedule")}>View All</button>
              </div>
              {todaySchedule.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">🎉</span><p>No appointments today!</p></div>
              ) : (
                <div className="schedule-list">
                  {todaySchedule.slice(0, 5).map((a) => (
                    <div className="schedule-item" key={a._id}>
                      <div className="schedule-time">{a.time}</div>
                      <div className="avatar green">{a.patient?.name?.charAt(0).toUpperCase()}</div>
                      <div className="schedule-patient">
                        <div className="schedule-name">{a.patient?.name}</div>
                        <div className="schedule-reason">{a.reason || "General Consultation"}</div>
                      </div>
                      <span className={`pill ${a.status}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TODAY'S SCHEDULE ── */}
        {activeTab === "schedule" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Today's Schedule</div>
                <div className="section-sub">{new Date().toDateString()}</div>
              </div>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🗓️</span><p>No appointments scheduled for today</p></div>
            ) : (
              <div className="schedule-list">
                {todaySchedule.map((a) => (
                  <div className="schedule-item" key={a._id}>
                    <div className="schedule-time">{a.time}</div>
                    <div className="avatar green">{a.patient?.name?.charAt(0).toUpperCase()}</div>
                    <div className="schedule-patient">
                      <div className="schedule-name">{a.patient?.name}</div>
                      <div className="schedule-reason">{a.reason || "General Consultation"}</div>
                    </div>
                    <span className={`pill ${a.status}`}>{a.status}</span>
                    <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                      {a.status === "pending" && (
                        <button className="btn btn-green btn-sm" onClick={() => updateAppt(a._id, "confirmed")}>Confirm</button>
                      )}
                      {a.status === "confirmed" && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateAppt(a._id, "completed")}>Complete</button>
                      )}
                      {(a.status === "pending" || a.status === "confirmed") && (
                        <button className="btn btn-red btn-sm" onClick={() => updateAppt(a._id, "cancelled")}>Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {activeTab === "appointments" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">All Appointments</div>
                <div className="section-sub">{appointments.length} total</div>
              </div>
            </div>
            {appointments.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">📅</span><p>No appointments yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id}>
                      <td><div className="cell-name"><div className="avatar green">{a.patient?.name?.charAt(0).toUpperCase()}</div>{a.patient?.name}</div></td>
                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "—"}</td>
                      <td>{a.reason || "—"}</td>
                      <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                      <td>
                        <select className="status-select" value={a.status} onChange={(e) => updateAppt(a._id, e.target.value)}>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── PATIENTS ── */}
        {activeTab === "patients" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">My Patients</div>
                <div className="section-sub">{patients.length} patient(s)</div>
              </div>
            </div>
            {patients.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🧑‍🦯</span><p>No patients yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td><div className="cell-name"><div className="avatar green">{p.name?.charAt(0).toUpperCase()}</div>{p.name}</div></td>
                      <td>{p.email}</td>
                      <td>{p.phone || "—"}</td>
                      <td>{fmtDate(p.createdAt)}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                          const convo = conversations.find((c) => String(c.user._id) === String(p._id));
                          if (convo) { setActiveTab("chat"); openConversation(convo); }
                          else {
                            setActiveTab("chat");
                            setActiveConvo({ user: p });
                            setMessages([]);
                          }
                        }}>💬 Message</button>
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
          <div className="chat-layout">
            {/* Conversations list */}
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <div className="chat-sidebar-title">💬 Messages</div>
              </div>
              <div className="chat-conversations">
                {conversations.length === 0 ? (
                  <div style={{ padding: 20, color: "var(--text-light)", fontSize: 13, textAlign: "center" }}>
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.user._id}
                      className={`convo-item ${activeConvo?.user?._id === c.user._id ? "active" : ""}`}
                      onClick={() => openConversation(c)}
                    >
                      <div className="convo-avatar">{c.user?.name?.charAt(0).toUpperCase()}</div>
                      <div className="convo-info">
                        <div className="convo-name">{c.user?.name}</div>
                        <div className="convo-last">{c.lastMessage}</div>
                      </div>
                      {c.unread > 0 && <span className="convo-unread">{c.unread}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat window */}
            <div className="chat-main">
              {!activeConvo ? (
                <div className="chat-no-select">
                  <span style={{ fontSize: 40 }}>💬</span>
                  <p>Select a conversation to start chatting</p>
                </div>
              ) : (
                <>
                  <div className="chat-header">
                    <div className="convo-avatar">{activeConvo.user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="chat-header-name">{activeConvo.user?.name}</div>
                      <div className="chat-header-sub">Patient</div>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="chat-empty">
                        <span className="chat-empty-icon">👋</span>
                        <p>Start the conversation</p>
                      </div>
                    ) : (
                      messages.map((msg, i) => {
                        const isSent = String(msg.sender?._id || msg.sender) === userId;
                        return (
                          <div key={i} className={`msg ${isSent ? "sent" : "received"}`}>
                            <div className="msg-bubble">{msg.content}</div>
                            <div className="msg-time">{fmtTime(msg.createdAt)}</div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-bar">
                    <input
                      className="chat-input"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button className="chat-send-btn" onClick={sendMessage}>➤</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="profile-layout">
            {/* Photo card */}
            <div className="profile-photo-card">
              <div className="photo-wrap">
                {photoPreview || profile?.photo ? (
                  <img
                    src={photoPreview || `${API}${profile.photo}`}
                    alt="profile"
                    className="profile-photo"
                  />
                ) : (
                  <div className="photo-initials">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button className="photo-upload-btn" onClick={() => fileInputRef.current.click()}>✎</button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
              </div>

              <div className="profile-name">Dr. {profile?.name}</div>
              <div className="profile-role">{profile?.specialty || "Doctor"}</div>

              {photoFile && (
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={uploadPhoto}>Upload Photo</button>
              )}

              <div style={{ width: "100%" }}>
                <div className="profile-stat">
                  <span>Email</span><span>{profile?.email}</span>
                </div>
                <div className="profile-stat">
                  <span>Experience</span><span>{profile?.experience ? `${profile.experience} yrs` : "—"}</span>
                </div>
                <div className="profile-stat">
                  <span>Status</span><span className={`pill ${profile?.status}`}>{profile?.status}</span>
                </div>
                <div className="profile-stat">
                  <span>Patients</span><span>{stats?.totalPatients ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="profile-form-card">
              <div className="section-header" style={{ padding: "0 0 16px" }}>
                <div>
                  <div className="section-title">Edit Profile</div>
                  <div className="section-sub">Update your information</div>
                </div>
                <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+1 234 567 8900" />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <input className="form-input" value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input className="form-input" type="number" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell patients about yourself..." />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}