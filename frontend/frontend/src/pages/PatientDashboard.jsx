import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/PatientDashboard.css";
import Logo from "../images/logo.jpeg";

const API = "http://localhost:5000";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const safeFetch = async (path, options = {}) => {
    try {
      const res = await fetch(`${API}${path}`, { headers, ...options });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const fetchData = async () => {
    try {
      const [profile, appts] = await Promise.all([
        safeFetch("/patient/profile"),
        safeFetch("/patient/appointments"),
      ]);
      if (profile) {
        setPatient(profile);
        setForm({ name: profile.name || "", phone: profile.phone || "" });
      }
      setAppointments(Array.isArray(appts) ? appts : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

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

  const statusColor = (s) => ({
    pending: "status-pending",
    confirmed: "status-confirmed",
    completed: "status-completed",
    cancelled: "status-cancelled",
  }[s] || "");

  if (loading) return (
    <div className="pd-loader">
      <div className="pd-loader-ring" />
      <p>Loading your profile...</p>
    </div>
  );

  const initials = patient?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";

  return (
    <div className="pd-root">
      {/* ── NAV (matches Homepage) ── */}
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
          <li>
            <button className="pd-nav-logout" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="pd-hero">
        <div className="pd-hero-overlay" />
        <div className="pd-hero-content">
          <div className="pd-avatar-wrap">
            <div className="pd-avatar">
              {patient?.photo
                ? <img src={`${API}${patient.photo}`} alt="Profile" />
                : <span>{initials}</span>
              }
            </div>
            <button
              className="pd-avatar-edit"
              onClick={() => fileRef.current.click()}
              disabled={uploadingPhoto}
              title="Change photo"
            >
              {uploadingPhoto ? "..." : "📷"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
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
          {[
            { key: "profile", label: "👤 My Profile" },
            { key: "appointments", label: `📅 Appointments (${appointments.length})` },
          ].map(t => (
            <button
              key={t.key}
              className={`pd-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="pd-content">

        {/* PROFILE TAB */}
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
                    <button className="pd-btn pd-btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
              }
            </div>

            <div className="pd-fields">
              <div className="pd-field">
                <label>Full Name</label>
                {editMode
                  ? <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                    />
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
                  ? <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+20 100 000 0000"
                    />
                  : <div className="pd-field-value">{patient?.phone || <span className="pd-empty">Not provided</span>}</div>
                }
              </div>

              <div className="pd-field">
                <label>Member Since</label>
                <div className="pd-field-value">{fmtDate(patient?.createdAt)}</div>
              </div>
            </div>

            {/* Photo upload card */}
            <div className="pd-photo-section">
              <div className="pd-photo-info">
                <h3>Profile Photo</h3>
                <p>Upload a clear photo so your doctors can recognise you easily.</p>
              </div>
              <button
                className="pd-btn pd-btn-outline"
                onClick={() => fileRef.current.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? "Uploading..." : "📷 Change Photo"}
              </button>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
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
                    <div className="pd-appt-avatar">
                      {a.doctor?.name?.charAt(0).toUpperCase() || "D"}
                    </div>
                    <div className="pd-appt-info">
                      <div className="pd-appt-doctor">{a.doctor?.name || "—"}</div>
                      <div className="pd-appt-specialty">{a.doctor?.specialty || "General"}</div>
                      <div className="pd-appt-meta">
                        <span>📅 {fmtDate(a.date)}</span>
                        {a.time && <span>🕐 {a.time}</span>}
                        {a.reason && <span>📋 {a.reason}</span>}
                      </div>
                    </div>
                    <span className={`pd-status ${statusColor(a.status)}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {toast && <div className={`pd-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}