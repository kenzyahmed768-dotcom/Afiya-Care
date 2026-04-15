import "../style/admindashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon"></div>
            <div className="brand-text">
              <h2>Afiya Care</h2>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>

        <div className="sidebar-body">
          <span className="nav-section-label">Navigation</span>

          <button className="nav-item active">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">⏳</span>
            <span className="nav-text">Pending Doctors</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">🧑‍⚕️</span>
            <span className="nav-text">All Doctors</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">📅</span>
            <span className="nav-text">Appointments</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">📋</span>
            <span className="nav-text">Doctor Schedules</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">🧑</span>
            <span className="nav-text">Patient Schedules</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">📄</span>
            <span className="nav-text">Applications</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>Overview</h1>
            <p>Afiya Care Admin Dashboard</p>
          </div>
          <div className="admin-pill">Admin</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box blue">🧑‍⚕️</div>
            <div>
              <div className="stat-value">1</div>
              <div className="stat-label">Total Doctors</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box green">🧑</div>
            <div>
              <div className="stat-value">2</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box amber">⏳</div>
            <div>
              <div className="stat-value">0</div>
              <div className="stat-label">Pending Doctors</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box slate">📅</div>
            <div>
              <div className="stat-value">0</div>
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
                  <div className="appt-bar pending" style={{ width: "0%" }}></div>
                </div>
                <span className="appt-stat-count">0</span>
              </div>

              <div className="appt-stat-row">
                <span className="appt-stat-label">Confirmed</span>
                <div className="appt-bar-wrap">
                  <div className="appt-bar confirmed" style={{ width: "0%" }}></div>
                </div>
                <span className="appt-stat-count">0</span>
              </div>

              <div className="appt-stat-row">
                <span className="appt-stat-label">Completed</span>
                <div className="appt-bar-wrap">
                  <div className="appt-bar completed" style={{ width: "0%" }}></div>
                </div>
                <span className="appt-stat-count">0</span>
              </div>

              <div className="appt-stat-row">
                <span className="appt-stat-label">Cancelled</span>
                <div className="appt-bar-wrap">
                  <div className="appt-bar cancelled" style={{ width: "0%" }}></div>
                </div>
                <span className="appt-stat-count">0</span>
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

            <div className="reg-item">
              <div className="avatar green"></div>
              <div className="reg-info">
                <div className="reg-name"></div>
                <div className="reg-email">kenzy.ahmed5@icloud.com</div>
                <div className="reg-date">Apr 15, 2026</div>
              </div>
              <span className="role-pill patient">patient</span>
            </div>

            <div className="reg-item">
              <div className="avatar green">A</div>
              <div className="reg-info">
                <div className="reg-name">Admin</div>
                <div className="reg-email">admin@afiya.com</div>
                <div className="reg-date">Apr 14, 2026</div>
              </div>
              <span className="role-pill admin">admin</span>
            </div>

            <div className="reg-item">
              <div className="avatar">A</div>
              <div className="reg-info">
                <div className="reg-name">abdallah</div>
                <div className="reg-email">abdallahbido99@gmail.com</div>
                <div className="reg-date">Apr 14, 2026</div>
              </div>
              <span className="role-pill doctor">doctor</span>
            </div>

            <div className="reg-item">
              <div className="avatar green">A</div>
              <div className="reg-info">
                <div className="reg-name">abdallah</div>
                <div className="reg-email">abdallahbido911@gmail.com</div>
                <div className="reg-date">Apr 14, 2026</div>
              </div>
              <span className="role-pill patient">patient</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;