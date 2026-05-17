import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Logo from "../images/logo.jpeg";
import "./Layout.css";

function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("userName");
    if (token && role) {
      setUser({ role, name: name || "User" });
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleDashboard = () => {
    setDropdownOpen(false);
    closeMenu();
    if (user?.role === "admin") navigate("/admin");
    else if (user?.role === "doctor") navigate("/doctor");
    else navigate("/patient");
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach((key) =>
      localStorage.removeItem(key)
    );
    setUser(null);
    setDropdownOpen(false);
    closeMenu();
    navigate("/");
  };

  return (
    <div className={`layout-root ${isMenuOpen ? "menu-open" : ""}`}>

      <nav className="site-nav">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
        </Link>

        <button
          type="button"
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <li><NavLink to="/" end onClick={closeMenu}>Home</NavLink></li>
          <li><NavLink to="/about" onClick={closeMenu}>About us</NavLink></li>
          <li><NavLink to="/join" onClick={closeMenu}>Join us</NavLink></li>
          <li><NavLink to="/booking" onClick={closeMenu}>Booking</NavLink></li>
          <li><NavLink to="/service" onClick={closeMenu}>Services</NavLink></li>
          <li><NavLink to="/blog" onClick={closeMenu}>Blog</NavLink></li>

          {user ? (
            <li className="profile-nav-item" ref={dropdownRef}>
              <button
                type="button"
                className="profile-icon-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <div className="profile-icon-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="profile-icon-name">
                  {user.name?.split(" ")[0] || "User"}
                </span>
                <svg
                  className={`profile-chevron ${dropdownOpen ? "open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="profile-dropdown-name">{user.name || "User"}</div>
                      <div className={`profile-dropdown-role ${user.role}`}>{user.role}</div>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button type="button" className="profile-dropdown-item" onClick={handleDashboard}>
                    <span>🏠</span> My Dashboard
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button type="button" className="profile-dropdown-item logout" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <>
              <li>
                <Link to="/login" className="btn-nav" onClick={closeMenu}>Login</Link>
              </li>
              <li>
                <Link to="/register" className="btn-nav btn-nav-signup" onClick={closeMenu}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
            </Link>
            <p>
              At Afiya Care, we provide expert physiotherapy services designed
              to restore movement, reduce pain, and support overall wellness.
              Our dedicated team combines personalized care with the latest
              techniques to help every patient achieve their recovery goals.
            </p>
          </div>

          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/join">Join us</Link></li>
              <li><Link to="/booking">Booking</Link></li>
              <li><Link to="/service">Services</Link></li>
              <li><Link to="/blog">Blog</Link></li>
               <li><Link to="/patient-community">Patient Community</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><Link to="/service">Orthopedic Physiotherapy</Link></li>
              <li><Link to="/service">Sports Injury</Link></li>
              <li><Link to="/service">Physiotherapy</Link></li>
              <li><Link to="/service">Surgical Rehabilitation</Link></li>
              <li><Link to="/service">Cardiac Rehab</Link></li>
              <li><Link to="/service">Elderly Care</Link></li>
              <li><Link to="/service">Home lab tests</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contact us</h5>
            <ul>
              <li><a href="mailto:afiyacare@gmail.com">afiyacare@gmail.com</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=61585057423569" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://www.instagram.com/afiyacare_1/?hl=en" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://wa.me/201014737320" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
            <div className="newsletter-row">
              <input type="email" placeholder="Your email" />
              <button type="button" aria-label="Subscribe">→</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61585057423569" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.instagram.com/afiyacare_1/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">i</a>
            
          </div>
          <p>© 2025 Afiya Care. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;