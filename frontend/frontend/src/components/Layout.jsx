// components/Layout.jsx
import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../images/logo.jpeg";
import "./Layout.css";

function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("userName");
    if (token && role) {
      setUser({ role, name });
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
    closeDropdown();
  }, [location]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDashboard = () => {
    setDropdownOpen(false);
    closeMenu();
    if (user?.role === "admin") navigate("/admin");
    else if (user?.role === "doctor") navigate("/doctor");
    else navigate("/patient");
  };

  const handleLogout = () => {
    ["token", "role", "userName", "userEmail"].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setDropdownOpen(false);
    closeMenu();
    navigate("/");
  };

  return (
    <>
      <nav>
        <Link to="/" className="logo">
          <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About us</Link></li>
          <li><Link to="/join" onClick={closeMenu}>Join us</Link></li>
          <li><Link to="/booking" onClick={closeMenu}>Booking</Link></li>
          <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
          <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
          <li><Link to="/help" onClick={closeMenu}>Help</Link></li>
          
          {user ? (
            <li className="profile-nav-item" ref={dropdownRef}>
              <button className="profile-icon-btn" onClick={() => setDropdownOpen(o => !o)}>
                <div className="profile-icon-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="profile-icon-name">{user.name?.split(" ")[0]}</span>
                <svg className={`profile-chevron ${dropdownOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="profile-dropdown-name">{user.name}</div>
                      <div className={`profile-dropdown-role ${user.role}`}>{user.role}</div>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={handleDashboard}>
                    <span>🏠</span> My Dashboard
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item logout" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <>
              <li><Link to="/login" className="btn-nav" onClick={closeMenu}>Login</Link></li>
              <li><Link to="/register" className="btn-nav btn-nav-signup" onClick={closeMenu}>Sign Up</Link></li>
            </>
          )}
        </ul>

        {/* Overlay for mobile menu */}
        {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
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
            <p>At Afiya Care, we provide expert physiotherapy services designed to restore movement, reduce pain, and support overall wellness. Our dedicated team combines personalized care with the latest techniques to help every patient achieve their recovery goals.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/join">Join us</Link></li>
              <li><Link to="/booking">Booking</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><Link to="/services">Orthopedic Physiotherapy</Link></li>
              <li><Link to="/services">Sports Injury</Link></li>
              <li><Link to="/services">Physiotherapy</Link></li>
              <li><Link to="/services">Surgical Rehabilitation</Link></li>
              <li><Link to="/services">Cardiac Rehab</Link></li>
              <li><Link to="/services">Elderly Care</Link></li>
              <li><Link to="/services">Home lab tests</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact us</h5>
            <ul>
              <li><a href="mailto:afiyacare@gmail.com">afiyacare@gmail.com</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">WhatsApp</a></li>
            </ul>
            <div className="newsletter-row">
              <input type="email" placeholder="Your email" />
              <button aria-label="Subscribe">→</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="social-links">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">t</a>
            <a href="#" aria-label="LinkedIn">in</a>
          </div>
          <p>© 2025 Afiya Care. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Layout;