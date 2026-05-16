import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AfiyaLogo from "../images/logo.jpeg";
import "../style/admindashboard.css";

const API = "http://localhost:5000";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    recentRegistrations: [],
  });

  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [messages, setMessages] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [reviewFilter, setReviewFilter] = useState("pending");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach((key) =>
      localStorage.removeItem(key)
    );
    navigate("/login");
  };

  const redirectByRole = (currentRole) => {
    if (currentRole === "doctor") navigate("/doctor");
    else if (currentRole === "patient") navigate("/patient");
    else navigate("/login");
  };

  const handleAccessDenied = async (res) => {
    if (res.status === 401 || res.status === 403) {
      showToast("Access denied. Admins only.", "error");
      handleLogout();
      return true;
    }

    return false;
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API}/admin/overview`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        setStats({
          totalDoctors: data.totalDoctors || 0,
          totalPatients: data.totalPatients || 0,
          pendingDoctors: data.pendingDoctors || 0,
          totalAppointments: data.totalAppointments || 0,
          pendingAppointments: data.pendingAppointments || 0,
          confirmedAppointments: data.confirmedAppointments || 0,
          completedAppointments: data.completedAppointments || 0,
          cancelledAppointments: data.cancelledAppointments || 0,
          recentRegistrations: Array.isArray(data.recentRegistrations)
            ? data.recentRegistrations
            : [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    }
  };

  const fetchPendingDoctors = async () => {
    try {
      const res = await fetch(`${API}/admin/pending-doctors`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setPendingDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pending doctors:", err);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const res = await fetch(`${API}/admin/all-doctors`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setAllDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch all doctors:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API}/admin/patients`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API}/admin/appointments`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API}/admin/applications`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const fetchMedicalFiles = async () => {
    try {
      const res = await fetch(`${API}/admin/medical-files`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setMedicalFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch medical files:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/admin/messages`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const fetchReviews = async (status = reviewFilter) => {
    try {
      const res = await fetch(`${API}/admin/reviews?status=${status}`, {
        headers,
      });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();
      if (res.ok) setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await fetch(`${API}/admin/reviews/stats`, { headers });
      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        setReviewStats({
          pending: data.pending || 0,
          approved: data.approved || 0,
          rejected: data.rejected || 0,
          total: data.total || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    }
  };

  const handleDoctorAction = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/doctor/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast(`Doctor ${status}`);
        fetchPendingDoctors();
        fetchAllDoctors();
        fetchOverview();
      } else {
        showToast(data.message || "Failed to update doctor", "error");
      }
    } catch {
      showToast("Failed to update doctor", "error");
    }
  };

  const handleDoctorDelete = async (id) => {
    if (!window.confirm("Delete this doctor and their related data?")) return;

    try {
      const res = await fetch(`${API}/admin/doctors/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Doctor deleted");
        fetchAllDoctors();
        fetchPendingDoctors();
        fetchOverview();
        fetchAppointments();
        fetchReviews(reviewFilter);
      } else {
        showToast(data.message || "Failed to delete doctor", "error");
      }
    } catch {
      showToast("Failed to delete doctor", "error");
    }
  };

  const handlePatientStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/patients/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Patient updated");
        fetchPatients();
        fetchOverview();
      } else {
        showToast(data.message || "Failed to update patient", "error");
      }
    } catch {
      showToast("Failed to update patient", "error");
    }
  };

  const handlePatientDelete = async (id) => {
    if (!window.confirm("Delete this patient and all related data?")) return;

    try {
      const res = await fetch(`${API}/admin/patients/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Patient deleted");
        fetchPatients();
        fetchOverview();
        fetchAppointments();
        fetchMedicalFiles();
        fetchMessages();
        fetchReviews(reviewFilter);
      } else {
        showToast(data.message || "Failed to delete patient", "error");
      }
    } catch {
      showToast("Failed to delete patient", "error");
    }
  };

  const handleAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/appointments/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Appointment updated");
        fetchAppointments();
        fetchOverview();
      } else {
        showToast(data.message || "Failed to update appointment", "error");
      }
    } catch {
      showToast("Failed to update appointment", "error");
    }
  };

  const handleAppointmentDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      const res = await fetch(`${API}/admin/appointments/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Appointment deleted");
        fetchAppointments();
        fetchOverview();
      } else {
        showToast(data.message || "Failed to delete appointment", "error");
      }
    } catch {
      showToast("Failed to delete appointment", "error");
    }
  };

  const handleApplicationStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/applications/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast(`Application ${status}`);
        fetchApplications();
      } else {
        showToast(data.message || "Failed to update application", "error");
      }
    } catch {
      showToast("Failed to update application", "error");
    }
  };

  const handleApplicationDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      const res = await fetch(`${API}/admin/applications/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Application deleted");
        fetchApplications();
      } else {
        showToast(data.message || "Failed to delete application", "error");
      }
    } catch {
      showToast("Failed to delete application", "error");
    }
  };

  const handleMedicalFileDelete = async (id) => {
    if (!window.confirm("Delete this medical file?")) return;

    try {
      const res = await fetch(`${API}/admin/medical-files/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Medical file deleted");
        fetchMedicalFiles();
      } else {
        showToast(data.message || "Failed to delete medical file", "error");
      }
    } catch {
      showToast("Failed to delete medical file", "error");
    }
  };

  const handleMessageDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const res = await fetch(`${API}/admin/messages/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Message deleted");
        fetchMessages();
      } else {
        showToast(data.message || "Failed to delete message", "error");
      }
    } catch {
      showToast("Failed to delete message", "error");
    }
  };

  const handleReviewAction = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/reviews/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast(`Review ${status}`);
        fetchReviews(reviewFilter);
        fetchReviewStats();
      } else {
        showToast(data.message || "Failed to update review", "error");
      }
    } catch {
      showToast("Failed to update review", "error");
    }
  };

  const handleReviewDelete = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;

    try {
      const res = await fetch(`${API}/admin/reviews/${id}`, {
        method: "DELETE",
        headers,
      });

      if (await handleAccessDenied(res)) return;

      const data = await res.json();

      if (res.ok) {
        showToast("Review deleted");
        fetchReviews(reviewFilter);
        fetchReviewStats();
      } else {
        showToast(data.message || "Failed to delete review", "error");
      }
    } catch {
      showToast("Failed to delete review", "error");
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!storedToken) {
      navigate("/login");
      return;
    }

    if (storedRole !== "admin") {
      showToast("Access denied. Admins only.", "error");
      redirectByRole(storedRole);
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchOverview(),
        fetchPendingDoctors(),
        fetchAllDoctors(),
        fetchPatients(),
        fetchAppointments(),
        fetchApplications(),
        fetchMedicalFiles(),
        fetchMessages(),
        fetchReviews(),
        fetchReviewStats(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (!loading && role === "admin") {
      fetchReviews(reviewFilter);
    }
  }, [reviewFilter]);

  const formatDate = (date) => {
    if (!date) return "---";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "---";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "---";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  const renderStars = (rating) => {
    const safeRating = Number(rating) || 0;
    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  };

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-ring"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const totalAppointments =
    stats.pendingAppointments +
    stats.confirmedAppointments +
    stats.completedAppointments +
    stats.cancelledAppointments;

  const maxAppointments = totalAppointments || 1;

  const navItems = [
    { key: "overview", icon: "📊", label: "Overview" },
    {
      key: "pendingDoctors",
      icon: "⏳",
      label: `Pending Doctors${
        stats.pendingDoctors > 0 ? ` (${stats.pendingDoctors})` : ""
      }`,
    },
    { key: "allDoctors", icon: "🧑‍⚕️", label: "All Doctors" },
    { key: "patients", icon: "🧑", label: `Patients (${patients.length})` },
    { key: "appointments", icon: "📅", label: "Appointments" },
    {
      key: "medicalFiles",
      icon: "📁",
      label: `Medical Files (${medicalFiles.length})`,
    },
    { key: "messages", icon: "💬", label: `Messages (${messages.length})` },
    {
      key: "reviews",
      icon: "⭐",
      label: `Reviews${reviewStats.pending > 0 ? ` (${reviewStats.pending})` : ""}`,
    },
    { key: "applications", icon: "📄", label: "Applications" },
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div
            className="sidebar-brand admin-clickable"
            onClick={() => navigate("/")}
            title="Go to website"
          >
            <img src={AfiyaLogo} alt="Afiya Care" className="admin-sidebar-logo" />
            <div className="brand-text">
              <h2>Afiya Care</h2>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>

        <div className="sidebar-body">
          <span className="nav-section-label">Navigation</span>

          {navItems.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`nav-item ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-text">{label}</span>
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
            <h1>{navItems.find((n) => n.key === activeTab)?.label || "Overview"}</h1>
            <p>Afiya Care Admin Dashboard</p>
          </div>

          <div className="admin-pill">Admin</div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">🧑‍⚕️</div>
                <div>
                  <div className="stat-value">{stats.totalDoctors}</div>
                  <div className="stat-label">Total Doctors</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box green">🧑</div>
                <div>
                  <div className="stat-value">{stats.totalPatients}</div>
                  <div className="stat-label">Total Patients</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box amber">⏳</div>
                <div>
                  <div className="stat-value">{stats.pendingDoctors}</div>
                  <div className="stat-label">Pending Doctors</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box slate">📅</div>
                <div>
                  <div className="stat-value">{totalAppointments}</div>
                  <div className="stat-label">Total Appointments</div>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <div className="section-title">Appointment Breakdown</div>
                    <div className="section-sub">Status distribution</div>
                  </div>
                </div>

                <div className="appt-stats">
                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Pending</span>
                    <div className="appt-bar-wrap">
                      <div
                        className="appt-bar pending"
                        style={{
                          width: `${(stats.pendingAppointments / maxAppointments) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="appt-stat-count">{stats.pendingAppointments}</span>
                  </div>

                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Confirmed</span>
                    <div className="appt-bar-wrap">
                      <div
                        className="appt-bar confirmed"
                        style={{
                          width: `${(stats.confirmedAppointments / maxAppointments) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="appt-stat-count">{stats.confirmedAppointments}</span>
                  </div>

                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Completed</span>
                    <div className="appt-bar-wrap">
                      <div
                        className="appt-bar completed"
                        style={{
                          width: `${(stats.completedAppointments / maxAppointments) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="appt-stat-count">{stats.completedAppointments}</span>
                  </div>

                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Cancelled</span>
                    <div className="appt-bar-wrap">
                      <div
                        className="appt-bar cancelled"
                        style={{
                          width: `${(stats.cancelledAppointments / maxAppointments) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="appt-stat-count">{stats.cancelledAppointments}</span>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-header">
                  <div>
                    <div className="section-title">Recent Registrations</div>
                    <div className="section-sub">Last 5 users</div>
                  </div>
                </div>

                {stats.recentRegistrations?.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">👤</span>
                    <p>No recent registrations</p>
                  </div>
                ) : (
                  stats.recentRegistrations?.map((user, index) => (
                    <div className="reg-item" key={user._id || index}>
                      <div className={`avatar ${user.role === "patient" ? "green" : ""}`}>
                        {getInitials(user.name)}
                      </div>

                      <div className="reg-info">
                        <div className="reg-name">{user.name}</div>
                        <div className="reg-email">{user.email}</div>
                        <div className="reg-date">{formatDate(user.createdAt)}</div>
                      </div>

                      <span className={`role-pill ${user.role}`}>{user.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "pendingDoctors" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Pending Doctor Approvals</div>
                <div className="section-sub">
                  {pendingDoctors.length} waiting for review
                </div>
              </div>
            </div>

            {pendingDoctors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No pending doctor approvals</p>
              </div>
            ) : (
              <div className="doctor-cards">
                {pendingDoctors.map((doc) => (
                  <div className="doctor-card" key={doc._id}>
                    <div className="doc-avatar">{getInitials(doc.name)}</div>

                    <div className="doc-info">
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-email">{doc.email}</div>

                      <div className="doc-tags">
                        <span className="doc-tag">{doc.specialty || "No specialty"}</span>
                        <span className="doc-tag">{doc.experience || "0"} years exp.</span>
                      </div>
                    </div>

                    <div className="doc-actions">
                      <button
                        className="btn btn-green"
                        onClick={() => handleDoctorAction(doc._id, "approved")}
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn-red"
                        onClick={() => handleDoctorAction(doc._id, "rejected")}
                      >
                        Reject
                      </button>

                      <button
                        className="btn btn-gray"
                        onClick={() => handleDoctorDelete(doc._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "allDoctors" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">All Doctors</div>
                <div className="section-sub">{allDoctors.length} registered</div>
              </div>
            </div>

            {allDoctors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🧑‍⚕️</span>
                <p>No doctors registered yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Experience</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {allDoctors.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar">{getInitials(doc.name)}</div>
                          {doc.name}
                        </div>
                      </td>
                      <td>{doc.specialty || "---"}</td>
                      <td>{doc.experience ? `${doc.experience} years` : "---"}</td>
                      <td>{doc.email}</td>
                      <td>
                        <span className={`pill ${doc.status}`}>{doc.status}</span>
                      </td>
                      <td>
                        <div className="application-actions">
                          <select
                            className="status-select"
                            value={doc.status}
                            onChange={(e) => handleDoctorAction(doc._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <button
                            className="btn btn-red btn-sm"
                            onClick={() => handleDoctorDelete(doc._id)}
                          >
                            Delete
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

        {activeTab === "patients" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">All Patients</div>
                <div className="section-sub">{patients.length} registered patients</div>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🧑</span>
                <p>No patients registered yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar green">{getInitials(patient.name)}</div>
                          {patient.name}
                        </div>
                      </td>
                      <td>{patient.email}</td>
                      <td>{patient.phone || "---"}</td>
                      <td>{formatDate(patient.createdAt)}</td>
                      <td>
                        <span className={`pill ${patient.status || "approved"}`}>
                          {patient.status || "approved"}
                        </span>
                      </td>
                      <td>
                        <div className="application-actions">
                          <select
                            className="status-select"
                            value={patient.status || "approved"}
                            onChange={(e) => handlePatientStatus(patient._id, e.target.value)}
                          >
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <button
                            className="btn btn-red btn-sm"
                            onClick={() => handlePatientDelete(patient._id)}
                          >
                            Delete
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
                    <th>Doctor / Lab</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar green">
                            {getInitials(appt.patient?.name || appt.patientName)}
                          </div>
                          {appt.patient?.name || appt.patientName || "Patient"}
                        </div>
                      </td>

                      <td>{appt.doctor?.name || appt.labName || "---"}</td>
                      <td>{formatDate(appt.date)}</td>
                      <td>{appt.time || "---"}</td>
                      <td>{appt.serviceType || "---"}</td>

                      <td>
                        <span className={`pill ${appt.status}`}>{appt.status}</span>
                      </td>

                      <td>
                        <div className="application-actions">
                          <select
                            className="status-select"
                            value={appt.status}
                            onChange={(e) =>
                              handleAppointmentStatus(appt._id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            className="btn btn-red btn-sm"
                            onClick={() => handleAppointmentDelete(appt._id)}
                          >
                            Delete
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

        {activeTab === "medicalFiles" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Medical Files</div>
                <div className="section-sub">All uploaded patient medical files</div>
              </div>
            </div>

            {medicalFiles.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📁</span>
                <p>No medical files uploaded yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Patient</th>
                    <th>Label</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {medicalFiles.map((file) => (
                    <tr key={file._id}>
                      <td>{file.filename}</td>
                      <td>{file.patient?.name || "Unknown"}</td>
                      <td>{file.label || "---"}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>{formatDate(file.createdAt)}</td>
                      <td>
                        <div className="application-actions">
                          <a
                            className="btn btn-primary btn-sm"
                            href={`${API}${file.url}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>

                          <button
                            className="btn btn-red btn-sm"
                            onClick={() => handleMedicalFileDelete(file._id)}
                          >
                            Delete
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

        {activeTab === "messages" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Messages</div>
                <div className="section-sub">Admin can review and delete system messages</div>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>No messages found</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg._id}>
                      <td>{msg.sender?.name || "Unknown"}</td>
                      <td>{msg.receiver?.name || "Unknown"}</td>
                      <td>{msg.content}</td>
                      <td>{formatDateTime(msg.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-red btn-sm"
                          onClick={() => handleMessageDelete(msg._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Review Moderation</div>
                <div className="section-sub">Approve or reject patient reviews</div>
              </div>

              <div className="review-filter-actions">
                <button
                  className={`btn ${reviewFilter === "pending" ? "btn-primary" : "btn-gray"}`}
                  onClick={() => setReviewFilter("pending")}
                >
                  Pending ({reviewStats.pending})
                </button>

                <button
                  className={`btn ${reviewFilter === "approved" ? "btn-primary" : "btn-gray"}`}
                  onClick={() => setReviewFilter("approved")}
                >
                  Approved ({reviewStats.approved})
                </button>

                <button
                  className={`btn ${reviewFilter === "rejected" ? "btn-primary" : "btn-gray"}`}
                  onClick={() => setReviewFilter("rejected")}
                >
                  Rejected ({reviewStats.rejected})
                </button>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⭐</span>
                <p>No {reviewFilter} reviews</p>
              </div>
            ) : (
              <div className="review-admin-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-admin-card">
                    <div className="review-admin-top">
                      <div className="review-admin-user">
                        <div className="avatar green review-avatar">
                          {getInitials(review.patient?.name)}
                        </div>

                        <div>
                          <div className="review-admin-name">
                            {review.patient?.name || "Patient"}
                          </div>
                          <div className="review-admin-email">
                            {review.patient?.email || "---"}
                          </div>
                          <div className="review-admin-date">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="review-admin-rating-box">
                        <div className="review-admin-stars">
                          {renderStars(review.rating)}
                        </div>
                        <span className={`pill ${review.status}`}>
                          {review.status}
                        </span>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="review-admin-title">{review.title}</h4>
                    )}

                    <p className="review-admin-comment">{review.comment}</p>

                    {review.doctor && (
                      <div className="review-admin-doctor">
                        👨‍⚕️ Dr. {review.doctor.name} · {review.doctor.specialty}
                      </div>
                    )}

                    <div className="review-admin-actions">
                      {review.status === "pending" && (
                        <>
                          <button
                            className="btn btn-green"
                            onClick={() => handleReviewAction(review._id, "approved")}
                          >
                            ✓ Approve
                          </button>

                          <button
                            className="btn btn-red"
                            onClick={() => handleReviewAction(review._id, "rejected")}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      <button
                        className="btn btn-gray"
                        onClick={() => handleReviewDelete(review._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Job Applications</div>
                <div className="section-sub">{applications.length} received</div>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <p>No applications yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar">{getInitials(app.firstName)}</div>
                          {app.firstName} {app.lastName}
                        </div>
                      </td>

                      <td>{app.email}</td>
                      <td>{app.role}</td>
                      <td>{app.experience || "---"}</td>

                      <td>
                        <span className={`pill ${app.status}`}>{app.status}</span>
                      </td>

                      <td>
                        <div className="application-actions">
                          <select
                            className="status-select"
                            value={app.status}
                            onChange={(e) =>
                              handleApplicationStatus(app._id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <button
                            className="btn btn-red btn-sm"
                            onClick={() => handleApplicationDelete(app._id)}
                          >
                            Delete
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
      </main>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}