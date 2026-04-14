// pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/admindashboard.css";  // ← Fixed: removed the extra dot

// ... rest of your code

const API = "http://localhost:5000";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [patientSchedules, setPatientSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const token   = localStorage.getItem("token");
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

  const fetchAll = async () => {
    try {
      const [ov, pending, doctors, dSched, pSched, appts, apps] = await Promise.all([
        safeFetch("/admin/overview"),
        safeFetch("/admin/pending-doctors"),
        safeFetch("/admin/all-doctors"),
        safeFetch("/admin/schedules/doctors"),
        safeFetch("/admin/schedules/patients"),
        safeFetch("/admin/appointments"),
        safeFetch("/admin/applications"),
      ]);
      if (ov) setOverview(ov);
      setPendingDoctors(Array.isArray(pending)  ? pending  : []);
      setAllDoctors(Array.isArray(doctors)      ? doctors  : []);
      setDoctorSchedules(Array.isArray(dSched)  ? dSched   : []);
      setPatientSchedules(Array.isArray(pSched) ? pSched   : []);
      setAppointments(Array.isArray(appts)      ? appts    : []);
      setApplications(Array.isArray(apps)       ? apps     : []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDoctorAction = async (id, status) => {
    try {
      const res  = await fetch(`${API}/admin/doctor/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (res.ok) { showToast(`Doctor ${status}`); fetchAll(); }
      else showToast(data.message, "error");
    } catch { showToast("Action failed", "error"); }
  };

  const handleApptStatus = async (id, status) => {
    try {
      const res  = await fetch(`${API}/admin/appointments/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (res.ok) { showToast("Appointment updated"); fetchAll(); }
      else showToast(data.message, "error");
    } catch { showToast("Action failed", "error"); }
  };

  const handleApplicationStatus = async (id, status) => {
    try {
      const res  = await fetch(`${API}/admin/applications/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (res.ok) { showToast(`Application marked as ${status}`); fetchAll(); }
      else showToast(data.message, "error");
    } catch { showToast("Action failed", "error"); }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      const res  = await fetch(`${API}/admin/applications/${id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (res.ok) { showToast("Application deleted"); fetchAll(); }
      else showToast(data.message, "error");
    } catch { showToast("Delete failed", "error"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  if (loading) return (
    <div className="loader-screen">
      <div className="loader-ring"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  const pendingApplications = applications.filter(a => a.status === "pending").length;

  const navItems = [
    { key: "overview",          icon: "📊", label: "Overview" },
    { key: "pending",           icon: "⏳", label: "Pending Doctors",  badge: pendingDoctors.length },
    { key: "doctors",           icon: "👨‍⚕️", label: "All Doctors" },
    { key: "appointments",      icon: "📅", label: "Appointments" },
    { key: "doctor-schedules",  icon: "🗓️", label: "Doctor Schedules" },
    { key: "patient-schedules", icon: "🧑‍🦯", label: "Patient Schedules" },
    { key: "applications",      icon: "📋", label: "Applications",     badge: pendingApplications },
  ];

  const tabTitle = navItems.find(n => n.key === activeTab)?.label || "";

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
            <h1>{tabTitle}</h1>
            <p>Afiya Care Admin Dashboard</p>
          </div>
          <div className="admin-pill">Admin</div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && overview && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-box blue">👨‍⚕️</div>
                <div><div className="stat-value">{overview.totalDoctors}</div><div className="stat-label">Total Doctors</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box green">🧑‍🦯</div>
                <div><div className="stat-value">{overview.totalPatients}</div><div className="stat-label">Total Patients</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box amber">⏳</div>
                <div><div className="stat-value">{overview.pendingDoctors}</div><div className="stat-label">Pending Doctors</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-box slate">📅</div>
                <div><div className="stat-value">{overview.totalAppointments}</div><div className="stat-label">Total Appointments</div></div>
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
                  {[
                    { label: "Pending",   key: "pendingAppointments",   cls: "pending" },
                    { label: "Confirmed", key: "confirmedAppointments", cls: "confirmed" },
                    { label: "Completed", key: "completedAppointments", cls: "completed" },
                    { label: "Cancelled", key: "cancelledAppointments", cls: "cancelled" },
                  ].map(({ label, key, cls }) => {
                    const count = overview[key] || 0;
                    const pct = overview.totalAppointments > 0 ? (count / overview.totalAppointments) * 100 : 0;
                    return (
                      <div className="appt-stat-row" key={key}>
                        <span className="appt-stat-label">{label}</span>
                        <div className="appt-bar-wrap">
                          <div className={`appt-bar ${cls}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="appt-stat-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <div className="section-title">Recent Registrations</div>
                    <div className="section-sub">Last 5 users</div>
                  </div>
                </div>
                {overview.recentRegistrations?.length === 0 ? (
                  <div className="empty-state"><span className="empty-icon">📭</span><p>No registrations yet</p></div>
                ) : (
                  overview.recentRegistrations?.map((u) => (
                    <div className="reg-item" key={u._id}>
                      <div className={`avatar ${u.role === "doctor" ? "" : "green"}`}>{u.name?.charAt(0).toUpperCase()}</div>
                      <div className="reg-info">
                        <div className="reg-name">{u.name}</div>
                        <div className="reg-email">{u.email}</div>
                        <div className="reg-date">{fmtDate(u.createdAt)}</div>
                      </div>
                      <span className={`role-pill ${u.role}`}>{u.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ── PENDING DOCTORS ── */}
        {activeTab === "pending" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Pending Approvals</div>
                <div className="section-sub">{pendingDoctors.length} doctor(s) awaiting review</div>
              </div>
            </div>
            {pendingDoctors.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🎉</span><p>All caught up — no pending doctors!</p></div>
            ) : (
              <div className="doctor-cards">
                {pendingDoctors.map((doc) => (
                  <div className="doctor-card" key={doc._id}>
                    <div className="doc-avatar">{doc.name?.charAt(0).toUpperCase()}</div>
                    <div className="doc-info">
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-email">{doc.email}</div>
                      <div className="doc-tags">
                        {doc.specialty && <span className="doc-tag">🩺 {doc.specialty}</span>}
                        {doc.experience && <span className="doc-tag">🕒 {doc.experience} yrs</span>}
                      </div>
                    </div>
                    <div className="doc-actions">
                      <button className="btn btn-green btn-sm" onClick={() => handleDoctorAction(doc._id, "approved")}>✓ Approve</button>
                      <button className="btn btn-red btn-sm" onClick={() => handleDoctorAction(doc._id, "rejected")}>✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL DOCTORS ── */}
        {activeTab === "doctors" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">All Doctors</div>
                <div className="section-sub">{allDoctors.length} registered</div>
              </div>
            </div>
            {allDoctors.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">👨‍⚕️</span><p>No doctors registered yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Specialty</th><th>Experience</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {allDoctors.map((doc) => (
                    <tr key={doc._id}>
                      <td><div className="cell-name"><div className="avatar">{doc.name?.charAt(0).toUpperCase()}</div>{doc.name}</div></td>
                      <td>{doc.email}</td>
                      <td>{doc.specialty || "—"}</td>
                      <td>{doc.experience ? `${doc.experience} yrs` : "—"}</td>
                      <td><span className={`pill ${doc.status}`}>{doc.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {doc.status !== "approved" && (
                            <button className="btn btn-green btn-sm" onClick={() => handleDoctorAction(doc._id, "approved")}>Approve</button>
                          )}
                          {doc.status !== "rejected" && (
                            <button className="btn btn-red btn-sm" onClick={() => handleDoctorAction(doc._id, "rejected")}>
                              {doc.status === "approved" ? "Revoke" : "Reject"}
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
                  <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Update</th></tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id}>
                      <td><div className="cell-name"><div className="avatar green">{a.patient?.name?.charAt(0).toUpperCase()}</div>{a.patient?.name || "—"}</div></td>
                      <td><div className="cell-name"><div className="avatar">{a.doctor?.name?.charAt(0).toUpperCase()}</div>{a.doctor?.name || "—"}</div></td>
                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "—"}</td>
                      <td>{a.reason || "—"}</td>
                      <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                      <td>
                        <select className="status-select" value={a.status} onChange={(e) => handleApptStatus(a._id, e.target.value)}>
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

        {/* ── DOCTOR SCHEDULES ── */}
        {activeTab === "doctor-schedules" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Doctor Schedules</div>
                <div className="section-sub">All appointments grouped by doctor</div>
              </div>
            </div>
            {doctorSchedules.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🗓️</span><p>No doctor appointments yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Doctor</th><th>Specialty</th><th>Patient</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {doctorSchedules.map((a) => (
                    <tr key={a._id}>
                      <td><div className="cell-name"><div className="avatar">{a.doctor?.name?.charAt(0).toUpperCase()}</div>{a.doctor?.name || "—"}</div></td>
                      <td>{a.doctor?.specialty || "—"}</td>
                      <td>{a.patient?.name || "—"}</td>
                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "—"}</td>
                      <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── PATIENT SCHEDULES ── */}
        {activeTab === "patient-schedules" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Patient Schedules</div>
                <div className="section-sub">All appointments grouped by patient</div>
              </div>
            </div>
            {patientSchedules.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🧑‍🦯</span><p>No patient appointments yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Specialty</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {patientSchedules.map((a) => (
                    <tr key={a._id}>
                      <td><div className="cell-name"><div className="avatar green">{a.patient?.name?.charAt(0).toUpperCase()}</div>{a.patient?.name || "—"}</div></td>
                      <td>{a.doctor?.name || "—"}</td>
                      <td>{a.doctor?.specialty || "—"}</td>
                      <td>{fmtDate(a.date)}</td>
                      <td>{a.time || "—"}</td>
                      <td>{a.reason || "—"}</td>
                      <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {activeTab === "applications" && (
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">Job Applications</div>
                <div className="section-sub">{applications.length} total · {pendingApplications} pending</div>
              </div>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">📋</span><p>No applications submitted yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th><th>Email</th><th>Phone</th><th>Role</th>
                    <th>Experience</th><th>Message</th><th>Applied</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="cell-name">
                          <div className="avatar" style={{ background: "#6366f1" }}>
                            {app.firstName?.charAt(0).toUpperCase()}
                          </div>
                          {app.firstName} {app.lastName}
                        </div>
                      </td>
                      <td>{app.email}</td>
                      <td>{app.phone || "—"}</td>
                      <td>{app.role}</td>
                      <td>{app.experience || "—"}</td>
                      <td style={{ maxWidth: 200 }}>
                        <span title={app.message} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                          {app.message || "—"}
                        </span>
                      </td>
                      <td>{fmtDate(app.createdAt)}</td>
                      <td><span className={`pill ${app.status}`}>{app.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {app.status === "pending" && (
                            <button className="btn btn-blue btn-sm" onClick={() => handleApplicationStatus(app._id, "reviewed")}>Review</button>
                          )}
                          {app.status !== "accepted" && (
                            <button className="btn btn-green btn-sm" onClick={() => handleApplicationStatus(app._id, "accepted")}>Accept</button>
                          )}
                          {app.status !== "rejected" && (
                            <button className="btn btn-red btn-sm" onClick={() => handleApplicationStatus(app._id, "rejected")}>Reject</button>
                          )}
                          <button className="btn btn-gray btn-sm" onClick={() => handleDeleteApplication(app._id)}>🗑</button>
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