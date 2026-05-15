// pages/PatientDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
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
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });

  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    doctorId: "",
    appointmentId: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [completedAppointmentsList, setCompletedAppointmentsList] = useState([]);

  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeConvoRef = useRef(null);
  const conversationsRef = useRef([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const safeFetch = async (path) => {
    try {
      const res = await fetch(`${API}${path}`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const [profile, appts, convos, reviewsData] = await Promise.all([
        safeFetch("/patient/profile"),
        safeFetch("/patient/appointments"),
        safeFetch("/chat/conversations/list"),
        safeFetch("/patient/reviews"),
      ]);

      if (profile) {
        setPatient(profile);
        setForm({
          name: profile.name || "",
          phone: profile.phone || "",
        });
      }

      const apptsList = Array.isArray(appts) ? appts : [];
      setAppointments(apptsList);

      const completed = apptsList.filter((a) => a.status === "completed");
      setCompletedAppointmentsList(completed);

      const now = new Date();

      setStats({
        totalAppointments: apptsList.length,
        upcomingAppointments: apptsList.filter(
          (a) => new Date(a.date) >= now && a.status !== "cancelled"
        ).length,
        completedAppointments: apptsList.filter((a) => a.status === "completed").length,
      });

      const convoList = Array.isArray(convos) ? convos : [];
      setConversations(convoList);
      setUnreadCount(convoList.reduce((sum, c) => sum + (c.unread || 0), 0));

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    fetchData();

    socket = io(API);
    socket.emit("join", userId);

    socket.on("receiveMessage", (msg) => {
      const senderId = String(msg.sender?._id || msg.sender);
      const currentConvo = activeConvoRef.current;
      const isCurrentOpen = String(currentConvo?.user?._id || "") === senderId;

      if (isCurrentOpen) {
        setMessages((prev) => [...prev, msg]);

        socket.emit("markRead", {
          senderId,
          receiverId: userId,
        });
      }

      setConversations((prev) => {
        const exists = prev.some((c) => String(c.user?._id) === senderId);

        if (exists) {
          return prev.map((c) =>
            String(c.user?._id) === senderId
              ? {
                  ...c,
                  lastMessage: msg.content,
                  unread: isCurrentOpen ? 0 : (c.unread || 0) + 1,
                }
              : c
          );
        }

        return [
          {
            user: msg.sender,
            lastMessage: msg.content,
            unread: isCurrentOpen ? 0 : 1,
          },
          ...prev,
        ];
      });

      if (!isCurrentOpen) {
        setUnreadCount((n) => n + 1);
      }
    });

    socket.on("messageSent", (msg) => {
      const receiverId = String(msg.receiver?._id || msg.receiver);
      const currentConvo = activeConvoRef.current;
      const isCurrentOpen = String(currentConvo?.user?._id || "") === receiverId;

      if (isCurrentOpen) {
        setMessages((prev) => [...prev, msg]);
      }

      setConversations((prev) => {
        const exists = prev.some((c) => String(c.user?._id) === receiverId);

        if (exists) {
          return prev.map((c) =>
            String(c.user?._id) === receiverId
              ? { ...c, lastMessage: msg.content }
              : c
          );
        }

        if (currentConvo?.user) {
          return [
            {
              user: currentConvo.user,
              lastMessage: msg.content,
              unread: 0,
            },
            ...prev,
          ];
        }

        return prev;
      });
    });

    return () => {
      if (socket) {
        socket.off("receiveMessage");
        socket.off("messageSent");
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (convo) => {
    setActiveConvo(convo);
    activeConvoRef.current = convo;

    try {
      const res = await fetch(`${API}/chat/${convo.user._id}`, { headers });
      const msgs = await res.json();

      setMessages(Array.isArray(msgs) ? msgs : []);

      socket.emit("markRead", {
        senderId: convo.user._id,
        receiverId: userId,
      });

      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(convo.user._id) ? { ...c, unread: 0 } : c
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - (convo.unread || 0)));
    } catch {
      showToast("Failed to load messages", "error");
    }
  };

  const openDoctorChat = (doctor) => {
    if (!doctor?._id) {
      showToast("Doctor information not found", "error");
      return;
    }

    const convo = conversationsRef.current.find(
      (c) => String(c.user?._id) === String(doctor._id)
    );

    setActiveTab("chat");

    if (convo) {
      openConversation(convo);
    } else {
      const newConvo = {
        user: doctor,
        lastMessage: "",
        unread: 0,
      };

      setActiveConvo(newConvo);
      activeConvoRef.current = newConvo;
      setMessages([]);
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

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch(`${API}/patient/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPatient(data.patient || { ...patient, ...form });
        localStorage.setItem("userName", form.name);
        showToast("Profile updated!");
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch {
      showToast("Could not connect to server", "error");
    } finally {
      setSaving(false);
    }
  };

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
        setPatient((p) => ({ ...p, photo: data.photo }));
        showToast("Photo updated!");
      } else {
        showToast(data.message || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.rating || !reviewForm.comment) {
      showToast("Please provide a rating and comment", "error");
      return;
    }

    setSubmittingReview(true);

    try {
      const res = await fetch(`${API}/patient/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(reviewForm),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Thank you for your review!");
        setReviews((prev) => [data.review, ...prev]);
        setShowReviewForm(false);

        setReviewForm({
          rating: 5,
          title: "",
          comment: "",
          doctorId: "",
          appointmentId: "",
        });

        fetchData();
      } else {
        showToast(data.message || "Failed to submit review", "error");
      }
    } catch {
      showToast("Could not connect to server", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/login");
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "---";

  const fmtTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (loading)
    return (
      <div className="pd-loader">
        <div className="pd-loader-ring" />
        <p>Loading your dashboard...</p>
      </div>
    );

  const initials =
    patient?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  const navItems = [
    { key: "home", icon: "🏠", label: "Home", path: "/" },
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "appointments", icon: "📅", label: `Appointments (${appointments.length})` },
    {
      key: "chat",
      icon: "💬",
      label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
    },
    { key: "reviews", icon: "⭐", label: "Reviews" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div className="pd-root">
      <aside className="pd-sidebar">
        <div
          className="pd-sidebar-top"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <div className="pd-sidebar-brand">
            <div className="pd-brand-icon">🏥</div>

            <div className="pd-brand-text">
              <h2>Afiya Care</h2>
              <span>Patient Portal</span>
            </div>
          </div>
        </div>

        <div className="pd-sidebar-body">
          <span className="pd-nav-section-label">Menu</span>

          {navItems.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`pd-nav-item ${activeTab === key ? "active" : ""}`}
              onClick={() => {
                if (key === "home") {
                  navigate("/");
                } else {
                  setActiveTab(key);
                }
              }}
            >
              <span className="pd-nav-icon">{icon}</span>
              <span className="pd-nav-text">{label}</span>
              {key === "chat" && unreadCount > 0 && (
                <span className="pd-nav-badge">{unreadCount}</span>
              )}
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
            <h1>{navItems.find((n) => n.key === activeTab)?.label}</h1>
            <p>Welcome back, {patient?.name?.split(" ")[0] || "Patient"}</p>
          </div>

          <div className="pd-user-pill">
            <div className="pd-user-avatar">{initials}</div>
            <span>Patient</span>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="pd-stats-grid">
              <div className="pd-stat-card">
                <div className="pd-stat-icon-box blue">📅</div>
                <div>
                  <div className="pd-stat-value">{stats.totalAppointments}</div>
                  <div className="pd-stat-label">Total Appointments</div>
                </div>
              </div>

              <div className="pd-stat-card">
                <div className="pd-stat-icon-box green">⏰</div>
                <div>
                  <div className="pd-stat-value">{stats.upcomingAppointments}</div>
                  <div className="pd-stat-label">Upcoming</div>
                </div>
              </div>

              <div className="pd-stat-card">
                <div className="pd-stat-icon-box purple">✅</div>
                <div>
                  <div className="pd-stat-value">{stats.completedAppointments}</div>
                  <div className="pd-stat-label">Completed</div>
                </div>
              </div>

              <div className="pd-stat-card">
                <div className="pd-stat-icon-box amber">💬</div>
                <div>
                  <div className="pd-stat-value">{unreadCount}</div>
                  <div className="pd-stat-label">Unread Messages</div>
                </div>
              </div>
            </div>

            <div className="pd-section-card">
              <div className="pd-section-header">
                <div>
                  <div className="pd-section-title">Upcoming Appointments</div>
                  <div className="pd-section-sub">Your next scheduled sessions</div>
                </div>

                <button
                  className="pd-btn pd-btn-primary"
                  onClick={() => navigate("/booking")}
                >
                  Book New
                </button>
              </div>

              {appointments.filter(
                (a) => new Date(a.date) >= new Date() && a.status !== "cancelled"
              ).length === 0 ? (
                <div className="pd-empty-state">
                  <span className="pd-empty-icon">📅</span>
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                appointments
                  .filter(
                    (a) =>
                      new Date(a.date) >= new Date() && a.status !== "cancelled"
                  )
                  .slice(0, 5)
                  .map((a) => (
                    <div className="pd-appointment-item" key={a._id}>
                      <div className="pd-appointment-time">{a.time}</div>

                      <div className="pd-avatar green">
                        {a.doctor?.name?.charAt(0).toUpperCase() || "D"}
                      </div>

                      <div className="pd-appointment-info">
                        <div className="pd-appointment-name">
                          Dr. {a.doctor?.name}
                        </div>
                        <div className="pd-appointment-reason">
                          {a.reason || "General Consultation"}
                        </div>
                      </div>

                      <span className={`pd-pill ${a.status}`}>{a.status}</span>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {activeTab === "appointments" && (
          <div className="pd-section-card">
            <div className="pd-section-header">
              <div>
                <div className="pd-section-title">All Appointments</div>
                <div className="pd-section-sub">{appointments.length} total</div>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="pd-empty-state">
                <span className="pd-empty-icon">📅</span>
                <p>No appointments yet</p>

                <button
                  className="pd-btn pd-btn-primary"
                  onClick={() => navigate("/booking")}
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <table className="pd-data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
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
                        <div className="pd-cell-name">
                          <div className="pd-avatar green">
                            {a.doctor?.name?.charAt(0).toUpperCase() || "D"}
                          </div>
                          Dr. {a.doctor?.name}
                        </div>
                      </td>

                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "---"}</td>
                      <td>{a.reason || "---"}</td>
                      <td>
                        <span className={`pd-pill ${a.status}`}>{a.status}</span>
                      </td>

                      <td>
                        {(a.status === "confirmed" || a.status === "completed") &&
                          a.doctor && (
                            <button
                              className="pd-btn pd-btn-primary pd-btn-sm"
                              onClick={() => openDoctorChat(a.doctor)}
                            >
                              💬 Message
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="pd-chat-layout">
            <div className="pd-chat-sidebar">
              <div className="pd-chat-sidebar-header">
                <div className="pd-chat-sidebar-title">💬 My Doctors</div>
              </div>

              <div className="pd-chat-conversations">
                {conversations.length === 0 ? (
                  <div className="pd-chat-empty-convos">
                    <span>👨‍⚕️</span>
                    <p>
                      No conversations yet.
                      <br />
                      Message a doctor from your appointments.
                    </p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.user._id}
                      className={`pd-convo-item ${
                        activeConvo?.user?._id === c.user._id ? "active" : ""
                      }`}
                      onClick={() => openConversation(c)}
                    >
                      <div className="pd-convo-avatar">
                        {c.user?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="pd-convo-info">
                        <div className="pd-convo-name">Dr. {c.user?.name}</div>
                        <div className="pd-convo-last">
                          {c.lastMessage || "Start a conversation"}
                        </div>
                      </div>

                      {c.unread > 0 && (
                        <span className="pd-convo-unread">{c.unread}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pd-chat-main">
              {!activeConvo ? (
                <div className="pd-chat-no-select">
                  <span>💬</span>
                  <p>Select a doctor to start chatting</p>
                </div>
              ) : (
                <>
                  <div className="pd-chat-header">
                    <div className="pd-convo-avatar">
                      {activeConvo.user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="pd-chat-header-name">
                        Dr. {activeConvo.user?.name}
                      </div>
                      <div className="pd-chat-header-sub">
                        {activeConvo.user?.specialty || "Doctor"}
                      </div>
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
                        const isSent =
                          String(msg.sender?._id || msg.sender) === String(userId);

                        return (
                          <div
                            key={msg._id || i}
                            className={`pd-msg ${isSent ? "sent" : "received"}`}
                          >
                            <div className="pd-msg-bubble">{msg.content}</div>
                            <div className="pd-msg-time">
                              {fmtTime(msg.createdAt)}
                            </div>
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

                    <button className="pd-chat-send-btn" onClick={sendMessage}>
                      ➤
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="pd-reviews-container">
            <div className="pd-section-card">
              <div className="pd-section-header">
                <div>
                  <div className="pd-section-title">My Reviews</div>
                  <div className="pd-section-sub">Share your experience with us</div>
                </div>

                {!showReviewForm && (
                  <button
                    className="pd-btn pd-btn-primary"
                    onClick={() => setShowReviewForm(true)}
                  >
                    ✏️ Write a Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="pd-review-form-container">
                  <form className="pd-review-form" onSubmit={handleSubmitReview}>
                    <h3>Share Your Feedback</h3>
                    <p>We'd love to hear about your experience!</p>

                    <div className="pd-form-group">
                      <label className="pd-form-label">
                        Select Appointment Optional
                      </label>

                      <select
                        className="pd-form-select"
                        value={reviewForm.appointmentId}
                        onChange={(e) => {
                          const appt = completedAppointmentsList.find(
                            (a) => a._id === e.target.value
                          );

                          setReviewForm({
                            ...reviewForm,
                            appointmentId: e.target.value,
                            doctorId: appt?.doctor?._id || "",
                          });
                        }}
                      >
                        <option value="">General Feedback</option>

                        {completedAppointmentsList.map((a) => (
                          <option key={a._id} value={a._id}>
                            {fmtDate(a.date)} with Dr. {a.doctor?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pd-form-group">
                      <label className="pd-form-label">Rating *</label>

                      <div className="pd-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`pd-star-btn ${
                              reviewForm.rating >= star ? "active" : ""
                            }`}
                            onClick={() =>
                              setReviewForm({ ...reviewForm, rating: star })
                            }
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pd-form-group">
                      <label className="pd-form-label">Title Optional</label>

                      <input
                        type="text"
                        className="pd-form-input"
                        placeholder="e.g., Great experience!"
                        value={reviewForm.title}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="pd-form-group">
                      <label className="pd-form-label">Your Review *</label>

                      <textarea
                        className="pd-form-textarea"
                        rows={4}
                        placeholder="Tell us about your experience with Afiya Care..."
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            comment: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="pd-form-actions">
                      <button
                        type="button"
                        className="pd-btn pd-btn-outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({
                            rating: 5,
                            title: "",
                            comment: "",
                            doctorId: "",
                            appointmentId: "",
                          });
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="pd-btn pd-btn-primary"
                        disabled={submittingReview}
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="pd-reviews-list">
                {reviews.length === 0 ? (
                  <div className="pd-empty-state">
                    <span className="pd-empty-icon">⭐</span>
                    <p>No reviews yet</p>

                    <button
                      className="pd-btn pd-btn-primary"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write Your First Review
                    </button>
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <div className="pd-review-item" key={review._id || index}>
                      <div className="pd-review-header">
                        <div className="pd-reviewer-info">
                          <div className="pd-reviewer-avatar">
                            {review.patient?.name?.charAt(0).toUpperCase() ||
                              initials}
                          </div>

                          <div>
                            <div className="pd-reviewer-name">
                              {review.patient?.name || patient?.name || "You"}
                            </div>
                            <div className="pd-review-date">
                              {fmtDate(review.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="pd-review-rating">
                          <span className="pd-stars-display">
                            {renderStars(review.rating)}
                          </span>
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="pd-review-title">{review.title}</h4>
                      )}

                      <p className="pd-review-comment">{review.comment}</p>

                      {review.doctor && (
                        <div className="pd-review-doctor">
                          <span>👨‍⚕️ Doctor: Dr. {review.doctor.name}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="pd-profile-layout">
            <div className="pd-profile-photo-card">
              <div className="pd-photo-wrap">
                {patient?.photo ? (
                  <img
                    src={`${API}${patient.photo}`}
                    alt="Profile"
                    className="pd-profile-photo"
                  />
                ) : (
                  <div className="pd-photo-initials">{initials}</div>
                )}

                <button
                  className="pd-photo-upload-btn"
                  onClick={() => fileRef.current.click()}
                  disabled={uploadingPhoto}
                >
                  ✎
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
              </div>

              <div className="pd-profile-name">{patient?.name}</div>
              <div className="pd-profile-role">Patient</div>

              {uploadingPhoto && <p>Uploading...</p>}

              <div style={{ width: "100%" }}>
                <div className="pd-profile-stat">
                  <span>Email</span>
                  <span>{patient?.email}</span>
                </div>

                <div className="pd-profile-stat">
                  <span>Phone</span>
                  <span>{patient?.phone || "---"}</span>
                </div>

                <div className="pd-profile-stat">
                  <span>Member Since</span>
                  <span>{fmtDate(patient?.createdAt)}</span>
                </div>

                <div className="pd-profile-stat">
                  <span>Appointments</span>
                  <span>{stats.totalAppointments}</span>
                </div>
              </div>
            </div>

            <div className="pd-profile-form-card">
              <div className="pd-section-header">
                <div>
                  <div className="pd-section-title">Edit Profile</div>
                  <div className="pd-section-sub">Update your information</div>
                </div>

                <button
                  className="pd-btn pd-btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="pd-form-grid">
                <div className="pd-form-group">
                  <label className="pd-form-label">Full Name</label>

                  <input
                    className="pd-form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="pd-form-group">
                  <label className="pd-form-label">Phone</label>

                  <input
                    className="pd-form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
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