// src/pages/Homepage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Homepage.css";
import Logo from "../images/logo.jpeg";

function Homepage() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    const name  = localStorage.getItem("userName");
    if (token && role) setUser({ role, name });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDashboard = () => {
    setDropdownOpen(false);
    if (user.role === "admin")   navigate("/admin");
    else if (user.role === "doctor")  navigate("/doctor");
    else navigate("/patient");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="/" className="logo">
          <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
        </a>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">About us</a></li>
          <li><a href="#">Join us</a></li>
          <li><a href="#">Booking</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Blog</a></li>

          {user ? (
            /* ── Logged in: show profile icon ── */
            <li className="profile-nav-item" ref={dropdownRef}>
              <button
                className="profile-icon-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                title={user.name}
              >
                <div className="profile-icon-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="profile-icon-name">{user.name?.split(" ")[0]}</span>
                <svg className={`profile-chevron ${dropdownOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
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
            /* ── Not logged in: show login button ── */
            <li>
              <a href="/login" className="btn-nav">Login</a>
            </li>
          )}
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome To Afiya Care—<br />Your Path To Better Health</h1>
          <p>Expert Physiotherapy Tailored To Your Recovery</p>
          <a href="#" className="btn-primary">Book An Appointment</a>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        <div className="services-header">
          <div>
            <div className="section-label">OUR SERVICES</div>
            <h2>Our Physiotherapy Services</h2>
            <p>Your recovery, your choice – at home or in-clinic sessions.</p>
          </div>
          <div className="nav-arrows">
            <button className="arrow-btn">&#8592;</button>
            <button className="arrow-btn active">&#8594;</button>
          </div>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-img">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80" alt="Cardiac Rehab" />
            </div>
            <div className="service-label">Cardiac Rehab</div>
          </div>
          <div className="service-card">
            <div className="service-img">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" alt="Sports Physiotherapy" />
            </div>
            <div className="service-label">Sports Physiotherapy</div>
          </div>
          <div className="service-card">
            <div className="service-img">
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80" alt="Orthopedic Physiotherapy" />
            </div>
            <div className="service-label">Orthopedic Physiotherapy</div>
          </div>
          <div className="service-card">
            <div className="service-img">
              <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80" alt="Surgical Rehabilitation" />
            </div>
            <div className="service-label">Surgical Rehabilitation</div>
          </div>
        </div>
      </section>

      {/* WHY AFIYA CARE */}
      <section className="why-section">
        <div className="why-image">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80" alt="Physiotherapy session" />
        </div>
        <div className="why-content">
          <h2>Why Afiya Care?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🏠</div>
              <h4>Flexible Care Options</h4>
              <p>Receive physiotherapy in-clinic or at the comfort of your home.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">👨‍⚕️</div>
              <h4>Experienced Therapists</h4>
              <p>Our therapists boast of 40+ years of combined experience.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📋</div>
              <h4>Personalized Programs</h4>
              <p>Tailored treatment plans designed for your unique needs and goals.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h4>Modern Facilities &amp; Techniques</h4>
              <p>Using the latest equipment and evidence-based practices for effective recovery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section">
        <div className="contact-form-area">
          <h3>Got a Question?</h3>
          <h2>Get in Touch<br />Submit an inquiry and our<br />team will get back to you</h2>
          <div className="form-row">
            <div className="form-field"><input type="text" placeholder="Full Name*" /></div>
            <div className="form-field"><input type="email" placeholder="Email*" /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><input type="tel" placeholder="Phone Number*" /></div>
            <div className="form-field"><input type="text" placeholder="Inquiry*" /></div>
          </div>
          <button className="btn-submit">Submit Inquiry</button>
        </div>
        <div className="contact-image-area">
          <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80" alt="Medical team" />
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"Afiya Care's at-home sessions have made my recovery so much easier. The team is professional and really effective!"</p>
            <div className="author">— Sara M., Cairo</div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="blog-section">
        <div className="section-label">Latest News</div>
        <h2>News and blogs about<br />physiotherapy</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80" alt="Exercises" />
            <div className="blog-card-body">
              <h3>5 Physiotherapy Exercises You Can Do at Home</h3>
              <a href="#" className="blog-read">Read more
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <div className="blog-card">
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80" alt="Neural" />
            <div className="blog-card-body">
              <h3>The Science Behind Physiotherapy and Neural Recovery</h3>
              <a href="#" className="blog-read">Read more
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <div className="blog-card">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" alt="Pain" />
            <div className="blog-card-body">
              <h3>Understanding Pain: When to See a Specialist</h3>
              <a href="#" className="blog-read">Read more
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="logo">
              <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
              <div className="logo-icon footer-logo-icon">AC</div>
              <div className="logo-text footer-logo-text">AFIYA<span>CARE</span></div>
            </a>
            <p>At Afiya Care, we provide expert physiotherapy services designed to restore movement, reduce pain, and support overall wellness.</p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About us</a></li>
              <li><a href="#">Join us</a></li>
              <li><a href="#">Booking</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              <li><a href="#">Orthopedic Physiotherapy</a></li>
              <li><a href="#">Sports Injury Physiotherapy</a></li>
              <li><a href="#">Surgical Rehabilitation</a></li>
              <li><a href="#">Cardiac Rehab</a></li>
              <li><a href="#">Elderly Care</a></li>
              <li><a href="#">Home lab tests</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact us</h5>
            <ul>
              <li><a href="#">afiyacare@gmail.com</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">WhatsApp</a></li>
            </ul>
            <div className="newsletter-row">
              <input type="email" placeholder="Your email" />
              <button>&#8594;</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="social-links">
            <a href="#">f</a><a href="#">t</a><a href="#">in</a>
          </div>
          <p>©️ 2025 Afiya Care. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Homepage;