import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "../style/DoctorDashboard.css";
import Logo from "../images/logo.jpeg";

const API = "http://localhost:5000";
let socket;

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [showFilesModal, setShowFilesModal] = useState(false);
  const [filesPatient, setFilesPatient] = useState(null);
  const [patientFiles, setPatientFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const get = async (path) => {
    const res = await fetch(`${API}${path}`, { headers });
    return res.json();
  };

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
        name: prof.name || "",
        specialty: prof.specialty || "",
        experience: prof.experience || "",
        bio: prof.bio || "",
        phone: prof.phone || "",
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

  useEffect(() => {
    if (!token || !userId) {
      window.location.href = "/login";
      return;
    }

    fetchAll();

    socket = io(API);
    socket.emit("join", userId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);

      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(msg.sender._id || msg.sender)
            ? {
                ...c,
                lastMessage: msg.content,
                unread:
                  activeConvo?.user?._id === String(msg.sender._id || msg.sender)
                    ? 0
                    : (c.unread || 0) + 1,
              }
            : c
        )
      );
    });

    socket.on("messageSent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const goToWebsite = () => {
    window.location.href = "/";
  };

  const openConversation = async (convo) => {
    setActiveConvo(convo);

    try {
      const msgs = await get(`/chat/${convo.user._id}`);
      setMessages(Array.isArray(msgs) ? msgs : []);

      socket.emit("markRead", {
        senderId: convo.user._id,
        receiverId: userId,
      });

      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(convo.user._id)
            ? { ...c, unread: 0 }
            : c
        )
      );
    } catch {
      showToast("Failed to load messages", "error");
    }
  };

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateAppt = async (id, status) => {
    try {
      const res = await fetch(`${API}/doctor/appointments/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Appointment updated");
        fetchAll();
      } else {
        showToast(data.message || "Failed to update", "error");
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch(`${API}/doctor/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Profile updated");
        setProfile(data.doctor);
      } else {
        showToast(data.message || "Failed to save profile", "error");
      }
    } catch {
      showToast("Failed to save profile", "error");
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;

    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const res = await fetch(`${API}/doctor/profile/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Photo updated");
        setProfile((p) => ({ ...p, photo: data.photo }));
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        showToast(data.message || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const openPatientFiles = async (patient) => {
    setFilesPatient(patient);
    setShowFilesModal(true);
    setLoadingFiles(true);
    setPatientFiles([]);

    try {
      const res = await fetch(`${API}/doctor/patients/${patient._id}/files`, {
        headers,
      });

      const data = await res.json();

      if (res.ok) {
        setPatientFiles(Array.isArray(data) ? data : []);
      } else {
        showToast(data.message || "Could not load files", "error");
      }
    } catch {
      showToast("Could not load files", "error");
    } finally {
      setLoadingFiles(false);
    }
  };

  const fileIcon = (mimetype = "", filename = "") => {
    if (mimetype?.includes("pdf") || filename?.endsWith(".pdf")) return "📄";
    if (mimetype?.includes("image")) return "🖼️";
    if (filename?.match(/\.(doc|docx)$/)) return "📝";
    return "📎";
  };

  const fmtSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const fmtTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-ring"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const navItems = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "schedule", icon: "🗓️", label: "Today's Schedule" },
    { key: "appointments", icon: "📅", label: "Appointments" },
    { key: "patients", icon: "🧑‍🦯", label: "My Patients" },
    { key: "chat", icon: "💬", label: "Chat", badge: stats?.unreadMessages },
    { key: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div className="doctor-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <button
              type="button"
              className="brand-icon brand-logo-btn"
              onClick={goToWebsite}
              title="Go to website"
            >
              <img src={Logo} alt="Afiya Care Logo" className="brand-logo" />
            </button>

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

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{navItems.find((n) => n.key === activeTab)?.label}</h1>
            <p>Welcome back, Dr. {profile?.name?.split(" ")[0]}</p>
          </div>

          <div className="doctor-pill">Doctor</div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">🧑‍🦯</div>
                <div>
                  <div className="stat-value">{stats?.totalPatients ?? 0}</div>
                  <div className="stat-label">Total Patients</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box green">📅</div>
                <div>
                  <div className="stat-value">
                    {stats?.totalAppointments ?? 0}
                  </div>
                  <div className="stat-label">Total Appointments</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box amber">⏳</div>
                <div>
                  <div className="stat-value">
                    {stats?.todayAppointments ?? 0}
                  </div>
                  <div className="stat-label">Today's Schedule</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box purple">💬</div>
                <div>
                  <div className="stat-value">
                    {stats?.unreadMessages ?? 0}
                  </div>
                  <div className="stat-label">Unread Messages</div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <div>
                  <div className="section-title">Today's Schedule</div>
                  <div className="section-sub">
                    {todaySchedule.length} appointment(s)
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab("schedule")}
                >
                  View All
                </button>
              </div>

              {todaySchedule.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🎉</span>
                  <p>No appointments today!</p>
                </div>
              ) : (
                <div className="schedule-list">
                  {todaySchedule.slice(0, 5).map((a) => (
                    <div className="schedule-item" key={a._id}>
                      <div className="schedule-time">{a.time}</div>

                      <div className="avatar green">
                        {a.patient?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="schedule-patient">
                        <div className="schedule-name">{a.patient?.name}</div>
                        <div className="schedule-reason">
                          {a.reason || "General Consultation"}
                        </div>
                      </div>

                      <span className={`pill ${a.status}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "schedule" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Today's Schedule</div>
                <div className="section-sub">{new Date().toDateString()}</div>
              </div>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗓️</span>
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="schedule-list">
                {todaySchedule.map((a) => (
                  <div className="schedule-item" key={a._id}>
                    <div className="schedule-time">{a.time}</div>

                    <div className="avatar green">
                      {a.patient?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="schedule-patient">
                      <div className="schedule-name">{a.patient?.name}</div>
                      <div className="schedule-reason">
                        {a.reason || "General Consultation"}
                      </div>
                    </div>

                    <span className={`pill ${a.status}`}>{a.status}</span>

                    <div className="schedule-actions">
                      {a.status === "pending" && (
                        <button
                          className="btn btn-green btn-sm"
                          onClick={() => updateAppt(a._id, "confirmed")}
                        >
                          Confirm
                        </button>
                      )}

                      {a.status === "confirmed" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateAppt(a._id, "completed")}
                        >
                          Complete
                        </button>
                      )}

                      {(a.status === "pending" ||
                        a.status === "confirmed") && (
                        <button
                          className="btn btn-red btn-sm"
                          onClick={() => updateAppt(a._id, "cancelled")}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">All Appointments</div>
                <div className="section-sub">{appointments.length} total</div>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <p>No appointments yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar green">
                            {a.patient?.name?.charAt(0).toUpperCase()}
                          </div>
                          {a.patient?.name}
                        </div>
                      </td>

                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "—"}</td>
                      <td>{a.reason || "—"}</td>

                      <td>
                        <span className={`pill ${a.status}`}>
                          {a.status}
                        </span>
                      </td>

                      <td>
                        <select
                          className="status-select"
                          value={a.status}
                          onChange={(e) => updateAppt(a._id, e.target.value)}
                        >
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

        {activeTab === "patients" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">My Patients</div>
                <div className="section-sub">{patients.length} patient(s)</div>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🧑‍🦯</span>
                <p>No patients yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar green">
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          {p.name}
                        </div>
                      </td>

                      <td>{p.email}</td>
                      <td>{p.phone || "—"}</td>
                      <td>{fmtDate(p.createdAt)}</td>

                      <td>
                        <div className="patient-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              const convo = conversations.find(
                                (c) => String(c.user._id) === String(p._id)
                              );

                              if (convo) {
                                setActiveTab("chat");
                                openConversation(convo);
                              } else {
                                setActiveTab("chat");
                                setActiveConvo({ user: p });
                                setMessages([]);
                              }
                            }}
                          >
                            💬 Message
                          </button>

                          <button
                            className="btn btn-files btn-sm"
                            onClick={() => openPatientFiles(p)}
                          >
                            📁 Files
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="chat-layout">
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <div className="chat-sidebar-title">💬 Messages</div>
              </div>

              <div className="chat-conversations">
                {conversations.length === 0 ? (
                  <div className="chat-no-conversations">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.user._id}
                      className={`convo-item ${
                        activeConvo?.user?._id === c.user._id ? "active" : ""
                      }`}
                      onClick={() => openConversation(c)}
                    >
                      <div className="convo-avatar">
                        {c.user?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="convo-info">
                        <div className="convo-name">{c.user?.name}</div>
                        <div className="convo-last">{c.lastMessage}</div>
                      </div>

                      {c.unread > 0 && (
                        <span className="convo-unread">{c.unread}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="chat-main">
              {!activeConvo ? (
                <div className="chat-no-select">
                  <span className="chat-empty-big-icon">💬</span>
                  <p>Select a conversation to start chatting</p>
                </div>
              ) : (
                <>
                  <div className="chat-header">
                    <div className="convo-avatar">
                      {activeConvo.user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="chat-header-name">
                        {activeConvo.user?.name}
                      </div>
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
                        const isSent =
                          String(msg.sender?._id || msg.sender) === userId;

                        return (
                          <div
                            key={i}
                            className={`msg ${isSent ? "sent" : "received"}`}
                          >
                            <div className="msg-bubble">{msg.content}</div>
                            <div className="msg-time">
                              {fmtTime(msg.createdAt)}
                            </div>
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

                    <button className="chat-send-btn" onClick={sendMessage}>
                      ➤
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-layout">
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

                <button
                  className="photo-upload-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  ✎
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-input"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="profile-name">Dr. {profile?.name}</div>
              <div className="profile-role">{profile?.specialty || "Doctor"}</div>

              {photoFile && (
                <button className="btn btn-primary full-btn" onClick={uploadPhoto}>
                  Upload Photo
                </button>
              )}

              <div className="profile-stats-box">
                <div className="profile-stat">
                  <span>Email</span>
                  <span>{profile?.email}</span>
                </div>

                <div className="profile-stat">
                  <span>Experience</span>
                  <span>
                    {profile?.experience ? `${profile.experience} yrs` : "—"}
                  </span>
                </div>

                <div className="profile-stat">
                  <span>Status</span>
                  <span className={`pill ${profile?.status}`}>
                    {profile?.status}
                  </span>
                </div>

                <div className="profile-stat">
                  <span>Patients</span>
                  <span>{stats?.totalPatients ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="profile-form-card">
              <div className="section-header profile-section-header">
                <div>
                  <div className="section-title">Edit Profile</div>
                  <div className="section-sub">Update your information</div>
                </div>

                <button className="btn btn-primary" onClick={saveProfile}>
                  Save Changes
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <input
                    className="form-input"
                    value={editForm.specialty}
                    onChange={(e) =>
                      setEditForm({ ...editForm, specialty: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    className="form-input"
                    type="number"
                    value={editForm.experience}
                    onChange={(e) =>
                      setEditForm({ ...editForm, experience: e.target.value })
                    }
                  />
                </div>

                <div className="form-group form-full">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="Tell patients about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showFilesModal && filesPatient && (
        <div
          className="dr-modal-overlay"
          onClick={() => setShowFilesModal(false)}
        >
          <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dr-modal-header">
              <div>
                <div className="dr-modal-title">
                  📁 Medical Files — {filesPatient.name}
                </div>
                <div className="dr-modal-sub">
                  Files uploaded by this patient
                </div>
              </div>

              <button
                className="dr-modal-close"
                onClick={() => setShowFilesModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="dr-modal-body">
              {loadingFiles ? (
                <div className="dr-modal-loading">
                  <div className="loader-ring" />
                  <p>Loading files…</p>
                </div>
              ) : patientFiles.length === 0 ? (
                <div className="dr-modal-empty">
                  <span>📂</span>
                  <p>This patient hasn't uploaded any files yet.</p>
                </div>
              ) : (
                <div className="dr-files-list">
                  {patientFiles.map((f) => (
                    <div className="dr-file-item" key={f._id}>
                      <span className="dr-file-icon">
                        {fileIcon(f.mimetype, f.filename)}
                      </span>

                      <div className="dr-file-info">
                        <div className="dr-file-name">{f.filename}</div>

                        <div className="dr-file-meta">
                          {f.label && (
                            <span className="dr-file-label">{f.label}</span>
                          )}

                          <span>{fmtSize(f.size)}</span>

                          {f.createdAt && (
                            <>
                              <span>·</span>
                              <span>{fmtDate(f.createdAt)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <a
                        href={`${API}${f.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}