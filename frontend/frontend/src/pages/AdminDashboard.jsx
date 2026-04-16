
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/admindashboard.css";

const API = "http://localhost:5000";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  
  
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    recentRegistrations: []
  });
  
  
  const [pendingDoctors, setPendingDoctors] = useState([]);
  
  
  const [allDoctors, setAllDoctors] = useState([]);
  
  
  const [appointments, setAppointments] = useState([]);
  
 
  const [applications, setApplications] = useState([]);
  
 
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [reviewFilter, setReviewFilter] = useState("pending");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach(k => localStorage.removeItem(k));
    navigate("/login");
  };

 
  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API}/admin/overview`, { headers });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    }
  };

  
  const fetchPendingDoctors = async () => {
    try {
      const res = await fetch(`${API}/admin/pending-doctors`, { headers });
      const data = await res.json();
      setPendingDoctors(data);
    } catch (err) {
      console.error("Failed to fetch pending doctors:", err);
    }
  };

 
  const fetchAllDoctors = async () => {
    try {
      const res = await fetch(`${API}/admin/all-doctors`, { headers });
      const data = await res.json();
      setAllDoctors(data);
    } catch (err) {
      console.error("Failed to fetch all doctors:", err);
    }
  };

  
  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API}/admin/appointments`, { headers });
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

 
  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API}/admin/applications`, { headers });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  
  const fetchReviews = async (status = reviewFilter) => {
    try {
      const res = await fetch(`${API}/admin/reviews?status=${status}`, { headers });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

 
  const fetchReviewStats = async () => {
    try {
      const res = await fetch(`${API}/admin/reviews/stats`, { headers });
      const data = await res.json();
      setReviewStats(data);
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    }
  };

 
  const handleDoctorAction = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/doctor/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Doctor ${status}`);
        fetchPendingDoctors();
        fetchAllDoctors();
        fetchOverview();
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Failed to update doctor", "error");
    }
  };

  
  const handleAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/appointments/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast("Appointment updated");
        fetchAppointments();
        fetchOverview();
      }
    } catch {
      showToast("Failed to update appointment", "error");
    }
  };

  
  const handleApplicationStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/applications/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Application ${status}`);
        fetchApplications();
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
        headers
      });
      if (res.ok) {
        showToast("Application deleted");
        fetchApplications();
      }
    } catch {
      showToast("Failed to delete application", "error");
    }
  };

  
  const handleReviewAction = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/reviews/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Review ${status}`);
        fetchReviews(reviewFilter);
        fetchReviewStats();
      } else {
        showToast(data.message, "error");
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
        headers
      });
      if (res.ok) {
        showToast("Review deleted");
        fetchReviews(reviewFilter);
        fetchReviewStats();
      }
    } catch {
      showToast("Failed to delete review", "error");
    }
  };

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchPendingDoctors(),
        fetchAllDoctors(),
        fetchAppointments(),
        fetchApplications(),
        fetchReviews(),
        fetchReviewStats()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [navigate]);

 
  useEffect(() => {
    if (!loading) {
      fetchReviews(reviewFilter);
    }
  }, [reviewFilter]);

  const formatDate = (date) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-ring"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const totalAppointments = stats.pendingAppointments + stats.confirmedAppointments + 
                           stats.completedAppointments + stats.cancelledAppointments;
  const maxAppointments = totalAppointments || 1;

  const navItems = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "pendingDoctors", icon: "⏳", label: `Pending Doctors${stats.pendingDoctors > 0 ? ` (${stats.pendingDoctors})` : ""}` },
    { key: "allDoctors", icon: "🧑‍⚕️", label: "All Doctors" },
    { key: "appointments", icon: "📅", label: "Appointments" },
    { key: "reviews", icon: "⭐", label: `Reviews${reviewStats.pending > 0 ? ` (${reviewStats.pending})` : ""}` },
    { key: "applications", icon: "📄", label: "Applications" }
  ];

  return (
    <div className="admin-layout">
      
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">🏥</div>
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
            <h1>{navItems.find(n => n.key === activeTab)?.label || "Overview"}</h1>
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
                      <div className="appt-bar pending" style={{ width: `${(stats.pendingAppointments / maxAppointments) * 100}%` }}></div>
                    </div>
                    <span className="appt-stat-count">{stats.pendingAppointments}</span>
                  </div>
                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Confirmed</span>
                    <div className="appt-bar-wrap">
                      <div className="appt-bar confirmed" style={{ width: `${(stats.confirmedAppointments / maxAppointments) * 100}%` }}></div>
                    </div>
                    <span className="appt-stat-count">{stats.confirmedAppointments}</span>
                  </div>
                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Completed</span>
                    <div className="appt-bar-wrap">
                      <div className="appt-bar completed" style={{ width: `${(stats.completedAppointments / maxAppointments) * 100}%` }}></div>
                    </div>
                    <span className="appt-stat-count">{stats.completedAppointments}</span>
                  </div>
                  <div className="appt-stat-row">
                    <span className="appt-stat-label">Cancelled</span>
                    <div className="appt-bar-wrap">
                      <div className="appt-bar cancelled" style={{ width: `${(stats.cancelledAppointments / maxAppointments) * 100}%` }}></div>
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
                  stats.recentRegistrations?.map((user, i) => (
                    <div className="reg-item" key={i}>
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
                <div className="section-sub">{pendingDoctors.length} waiting for review</div>
              </div>
            </div>
            {pendingDoctors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No pending doctor approvals</p>
              </div>
            ) : (
              <div className="doctor-cards">
                {pendingDoctors.map(doc => (
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
                      <button className="btn btn-green" onClick={() => handleDoctorAction(doc._id, "approved")}>
                        Approve
                      </button>
                      <button className="btn btn-red" onClick={() => handleDoctorAction(doc._id, "rejected")}>
                        Reject
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
                  </tr>
                </thead>
                <tbody>
                  {allDoctors.map(doc => (
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
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar green">{getInitials(appt.patient?.name)}</div>
                          {appt.patient?.name}
                        </div>
                      </td>
                      <td>{appt.doctor?.name}</td>
                      <td>{formatDate(appt.date)}</td>
                      <td>{appt.time || "---"}</td>
                      <td>
                        <span className={`pill ${appt.status}`}>{appt.status}</span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={appt.status}
                          onChange={(e) => handleAppointmentStatus(appt._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
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

      
        {activeTab === "reviews" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Review Moderation</div>
                <div className="section-sub">Approve or reject patient reviews</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
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
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {reviews.map(review => (
                  <div key={review._id} style={{
                    background: "#f8fafc",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "20px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="avatar green" style={{ width: "40px", height: "40px", fontSize: "14px" }}>
                          {getInitials(review.patient?.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "14px" }}>{review.patient?.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{review.patient?.email}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "2px" }}>
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ color: "#fbbf24", fontSize: "18px", letterSpacing: "2px" }}>
                          {renderStars(review.rating)}
                        </div>
                        <span className={`pill ${review.status}`}>{review.status}</span>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "var(--text-dark)" }}>
                        {review.title}
                      </h4>
                    )}
                    
                    <p style={{ fontSize: "13px", color: "var(--text-mid)", lineHeight: 1.6, marginBottom: "12px" }}>
                      {review.comment}
                    </p>
                    
                    {review.doctor && (
                      <div style={{ 
                        display: "inline-block", 
                        padding: "4px 12px", 
                        background: "#e6f9f7", 
                        borderRadius: "20px", 
                        fontSize: "12px",
                        marginBottom: "16px"
                      }}>
                        👨‍⚕️ Dr. {review.doctor.name} · {review.doctor.specialty}
                      </div>
                    )}
                    
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                      {review.status === "pending" && (
                        <>
                          <button className="btn btn-green" onClick={() => handleReviewAction(review._id, "approved")}>
                            ✓ Approve
                          </button>
                          <button className="btn btn-red" onClick={() => handleReviewAction(review._id, "rejected")}>
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button className="btn btn-gray" onClick={() => handleReviewDelete(review._id)}>
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
                  {applications.map(app => (
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
                        <select
                          className="status-select"
                          value={app.status}
                          onChange={(e) => handleApplicationStatus(app._id, e.target.value)}
                          style={{ marginRight: "8px" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button className="btn btn-red btn-sm" onClick={() => handleApplicationDelete(app._id)}>
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
      </main>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}