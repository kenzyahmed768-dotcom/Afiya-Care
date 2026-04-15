import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Homepage.css";
import "../style/Services.css";
import Logo from "../images/logo.jpeg";


const BODY_ZONES = [
  { id: "shoulder", label: "Shoulder",     cx: 82,  cy: 148, service: "Orthopedic Rehabilitation",   desc: "Rotator cuff repairs, frozen shoulder, impingement syndrome & post-surgical shoulder recovery." },
  { id: "spine",    label: "Spine",        cx: 120, cy: 185, service: "Back Pain Management",         desc: "Targeted spinal mobilisation, core stabilisation & postural correction for lasting relief." },
  { id: "hip",      label: "Hip",          cx: 120, cy: 252, service: "Pelvic Rehabilitation",        desc: "Hip replacement rehab, pelvic floor therapy & sacroiliac joint dysfunction treatment." },
  { id: "knee",     label: "Knee",         cx: 103, cy: 315, service: "Sports Rehabilitation",        desc: "ACL/meniscus recovery, runner's knee, patellofemoral syndrome & post-arthroscopy rehab." },
  { id: "foot",     label: "Ankle & Foot", cx: 103, cy: 378, service: "Sports Rehabilitation",        desc: "Ankle sprains, plantar fasciitis, Achilles tendinopathy & biomechanical footwear advice." },
  { id: "neck",     label: "Neck",         cx: 120, cy: 115, service: "Occupational Physiotherapy",   desc: "Cervical strain, whiplash, tech-neck syndrome & ergonomic workplace assessment." },
  { id: "elbow",    label: "Elbow & Wrist",cx: 62,  cy: 220, service: "Occupational Physiotherapy",   desc: "Tennis/golfer's elbow, carpal tunnel, repetitive strain injuries & post-fracture rehab." },
];

function BodyMap() {
  const [active, setActive] = useState(null);
  const zone = BODY_ZONES.find((z) => z.id === active);

  return (
    <div className="ab-bodymap-wrap">
      <div className="ab-bodymap-left">
        <svg viewBox="0 0 240 420" className="ab-body-svg" xmlns="http://www.w3.org/2000/svg">
          {/* ── Silhouette ── */}
          <g className="ab-body-silhouette">
            <ellipse cx="120" cy="60" rx="28" ry="34" />
            <rect x="111" y="90" width="18" height="22" rx="6" />
            <path d="M75 112 Q65 115 60 145 L55 230 Q54 245 70 248 L170 248 Q186 245 185 230 L180 145 Q175 115 165 112 Z" />
            <path d="M75 118 Q50 130 44 175 Q42 195 52 200 Q62 205 68 185 L78 140 Z" />
            <path d="M50 198 Q40 220 38 248 Q37 260 48 262 Q58 263 62 248 L68 218 Z" />
            <ellipse cx="43" cy="270" rx="10" ry="14" />
            <path d="M165 118 Q190 130 196 175 Q198 195 188 200 Q178 205 172 185 L162 140 Z" />
            <path d="M190 198 Q200 220 202 248 Q203 260 192 262 Q182 263 178 248 L172 218 Z" />
            <ellipse cx="197" cy="270" rx="10" ry="14" />
            <path d="M85 248 Q78 280 76 315 Q75 330 88 334 Q100 336 104 318 L108 255 Z" />
            <path d="M155 248 Q162 280 164 315 Q165 330 152 334 Q140 336 136 318 L132 255 Z" />
            <path d="M78 330 Q74 362 73 390 Q72 404 84 406 Q96 407 98 392 L104 334 Z" />
            <path d="M162 330 Q166 362 167 390 Q168 404 156 406 Q144 407 142 392 L136 334 Z" />
            <ellipse cx="78" cy="410" rx="14" ry="8" />
            <ellipse cx="162" cy="410" rx="14" ry="8" />
          </g>

          {/* ── Hotspots ── */}
          {BODY_ZONES.map((z) => (
            <g key={z.id} className={`ab-zone ${active === z.id ? "ab-zone-active" : ""}`}
               onClick={() => setActive(active === z.id ? null : z.id)}>
              <circle cx={z.cx} cy={z.cy} r="13" className="ab-zone-ring" />
              <circle cx={z.cx} cy={z.cy} r="7"  className="ab-zone-dot" />
              {["shoulder", "elbow"].includes(z.id) && (
                <g onClick={(e) => { e.stopPropagation(); setActive(active === z.id ? null : z.id); }}>
                  <circle cx={240 - z.cx} cy={z.cy} r="13" className="ab-zone-ring" />
                  <circle cx={240 - z.cx} cy={z.cy} r="7"  className="ab-zone-dot" />
                </g>
              )}
            </g>
          ))}
        </svg>
        <p className="ab-bodymap-hint">Tap a highlighted area to explore services</p>
      </div>

      <div className="ab-bodymap-right">
        {zone ? (
          <div className="ab-zone-info ab-zone-info-active" key={zone.id}>
            <div className="ab-zone-info-tag">{zone.label}</div>
            <h3>{zone.service}</h3>
            <p>{zone.desc}</p>
            <button className="ab-zone-cta" onClick={() => window.location.href = "/booking"}>
              Book a Session →
            </button>
          </div>
        ) : (
          <div className="ab-zone-info ab-zone-placeholder">
            <div className="ab-zone-placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="38" height="38">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3>Select a body area</h3>
            <p>Tap any glowing point on the body to discover which of our physiotherapy services targets that area.</p>
            <div className="ab-zone-list">
              {BODY_ZONES.map((z) => (
                <button key={z.id} className="ab-zone-chip" onClick={() => setActive(z.id)}>
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



const SERVICES = [
  { label: "Post surgery rehab",          img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { label: "Sports injury rehab",         img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80" },
  { label: "Speech therapy",              img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80" },
  { label: "Muscle and joint diseases",   img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80" },
  { label: "Post cardiovascular diseases",img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80" },
  { label: "Nursing and elderly care",    img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80" },
  { label: "In-clinic physiotherapy",     img: "https://images.unsplash.com/photo-1573377378599-f14e90f4f0da?w=600&q=80" },
  { label: "At home lab tests",           img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" },
];

const SMART_CARE = [
  {
    id: "telehealth",
    title: "Virtual Consultations",
    desc: "Connect with our top physiotherapists from the comfort of your home. Receive real-time form correction, guided exercises, and progress tracking through secure, high-definition video.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
  },
  {
    id: "wearables",
    title: "Wearable Integration",
    desc: "Sync your smartwatch or fitness tracker directly with the AfiyaCare portal. Our system monitors your vitals, step count, and mobility metrics daily to adapt your recovery plan dynamically.",
    img: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80"
  },
  {
    id: "elderly",
    title: "Elderly Home Monitoring",
    desc: "Designed specifically to keep senior patients safe and independent. Features include fall detection integration, daily mobility tracking, and instant emergency response alerts.",
    img: "https://images.openai.com/static-rsc-4/LzsK0rbQuSUChpXwRvsx6k9q3xnQwqcw6V-Rpm18X9FzQVpwIIa7rehnZVAD4XnwJ7I4bevyAGqVti5YBHFXM8udC-QHbCiPBzAlMxtQZUgyVc0voghPtvo8WRoxCTXbY73cVqKVOGqKivaCdOJ42w65mzQN8_R_TglJ36M8GEgxn88anJiNvXO8FRBF-M-g?purpose=fullsize"
  }
];

const EXCELLENCE = [
  { label: "experienced team", svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: "advanced technology", svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { label: "personalized treatment", svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg> },
  { label: "expertise and experience", svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  { label: "community involvement", svg: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
];

const REVIEWS = [
  { name: "Chris W.", role: "Professional Athlete", img: "https://randomuser.me/api/portraits/men/32.jpg", text: "After my knee surgery, the team at Physiocare helped me regain my mobility. The personalised treatment plan was incredible." },
  { name: "Tom H.",   role: "Marathon Runner",      img: "https://randomuser.me/api/portraits/men/36.jpg", text: "The therapists here are amazing! I was dealing with chronic back pain, and after just a few sessions the difference was unbelievable." },
];

export default function Services() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [activeSmartTab, setActiveSmartTab] = useState("telehealth");
  const activeSmartData = SMART_CARE.find(t => t.id === activeSmartTab);

  // ── Auth ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    const name  = localStorage.getItem("userName");
    if (token && role) setUser({ role, name });
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Scroll reveal ──
  useEffect(() => {
    const reveals = document.querySelectorAll(".sv-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("sv-visible"); }),
      { threshold: 0.08 }
    );
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleDashboard = () => {
    setDropdownOpen(false);
    if (user.role === "admin")       navigate("/admin");
    else if (user.role === "doctor") navigate("/doctor");
    else                             navigate("/patient");
  };
  const handleLogout = () => {
    ["token","role","userName","userEmail"].forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <>
      {/* ══ NAV ══ */}
      <nav>
        <a href="/" className="logo">
          <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
        </a>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About us</a></li>
          <li><a href="/join">Join us</a></li>
          <li><a href="/booking">Booking</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/blog">Blog</a></li>

          {user ? (
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
            <li><a href="/login" className="btn-nav">Login</a></li>
          )}
        </ul>
      </nav>

      {/* ══ HERO ══ */}
      <section className="sv-hero">
        <div className="sv-hero-bg"></div>
        <div className="sv-hero-overlay"></div>
        <div className="sv-hero-content">
          {/* This small tag breaks the "empty" grey feeling */}
          <span className="sv-hero-tag">AfiyaCare Excellence</span>
          <h1>Services List</h1>
        </div>
      </section>

      {/* ══ PROCESS SECTION ══ */}
      <section className="sv-process">
        {/* Left: steps */}
        <div className="sv-process-steps sv-reveal">
          <div className="sv-step">
            <h3>Initial Contact</h3>
            <p>contact clinic via phone, email, or online booking systems.</p>
          </div>
          <div className="sv-step">
            <h3 className="sv-step-teal">treatment planning</h3>
            <p>treatment plan is developed, outlining the methods and techniques.</p>
          </div>
          <div className="sv-step">
            <h3>discharge and maintenance</h3>
            <p>treatment goals are achieved, the patient is discharged from regular therapy sessions.</p>
          </div>
        </div>

        {/* Middle: photo */}
        <div className="sv-process-img sv-reveal">
          <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80" alt="Service process" />
        </div>

        {/* Right: description */}
        <div className="sv-process-desc sv-reveal">
          <h2>The complete service process</h2>
          <p>We understand that injuries and acute pain can happen unexpectedly. Our emergency physiotherapy services are designed to provide prompt and effective care to help you manage.</p>
          <button className="sv-appt-btn" onClick={() => navigate("/booking")}>Make an Appointment</button>
        </div>
      </section>

      {/* ══ SERVICES GRID ══ */}
      <section className="sv-services sv-reveal">
        <h2 className="sv-services-title">Services</h2>

        {/* Row 1 — 3 cards */}
        <div className="sv-grid-row sv-row-3">
          {SERVICES.slice(0, 3).map((s) => (
            <div className="sv-card" key={s.label}>
              <img src={s.img} alt={s.label} />
              <div className="sv-card-overlay">
                <span className="sv-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                </span>
                <span className="sv-card-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 — 3 cards */}
        <div className="sv-grid-row sv-row-3">
          {SERVICES.slice(3, 6).map((s) => (
            <div className="sv-card" key={s.label}>
              <img src={s.img} alt={s.label} />
              <div className="sv-card-overlay">
                <span className="sv-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                </span>
                <span className="sv-card-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 3 — 2 cards centered */}
        <div className="sv-grid-row sv-row-2">
          {SERVICES.slice(6, 8).map((s) => (
            <div className="sv-card" key={s.label}>
              <img src={s.img} alt={s.label} />
              <div className="sv-card-overlay">
                <span className="sv-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                </span>
                <span className="sv-card-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SMART HOME CARE SECTION ══ */}
      <section className="sv-smart-care sv-reveal">
        <div className="sv-sc-glass-card">
          <div className="sv-sc-left">
            <span className="sv-hero-tag">Intelligent Rehab</span>
            <h2>Smart Home Care <br/>& Tele-Rehab</h2>
            
            {/* Interactive Tabs */}
            <div className="sv-sc-tabs">
              {SMART_CARE.map((tab) => (
                <button 
                  key={tab.id} 
                  className={`sv-sc-tab ${activeSmartTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveSmartTab(tab.id)}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Dynamic Content: The 'key' forces the fade animation to replay */}
            <div className="sv-sc-content" key={activeSmartData.id}>
              <p>{activeSmartData.desc}</p>
              <button className="sv-sc-btn" onClick={() => navigate("/booking")}>
                Explore Tele-Rehab →
              </button>
            </div>
          </div>

          {/* Dynamic Image */}
          <div className="sv-sc-right">
            <div className="sv-sc-img-wrap" key={`img-${activeSmartData.id}`}>
              <img src={activeSmartData.img} alt={activeSmartData.title} />
            </div>
          </div>
        </div>
      </section>

      <section className="ab-bodymap-section">
        <p className="ab-eyebrow" style={{ textAlign: "center", marginBottom: 12 }}> Interactive Map</p>
        <h2 className="ab-section-title" style={{ color: "var(--ab-navy)", marginBottom: 40 }}>
          Where Does It Hurt?
        </h2>
        <BodyMap />
      </section>

      {/* ══ EXCELLENCE ══ */}
      <section className="sv-excellence sv-reveal">
        <h2>Excellence in care<br />and rehabilitation</h2>
        <div className="sv-excellence-cards">
          {EXCELLENCE.map((e) => (
            <div className="sv-exc-card" key={e.label}>
              <div className="sv-exc-icon">{e.svg}</div>
              <span>{e.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="sv-footer">
        <div className="sv-footer-grid">
          <div className="sv-footer-brand">
            <a href="/" className="sv-footer-logo">
              <img src={Logo} alt="AfiyaCare" className="sv-logo-img" />
              <span className="sv-footer-brand-name">AFIYA<em>CARE</em></span>
            </a>
            <p>At Afiya Care, we provide expert physiotherapy services designed to restore movement, reduce pain, and support overall wellness.</p>
          </div>
          <div className="sv-footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About us</a></li>
              <li><a href="/join">Join us</a></li>
              <li><a href="/booking">Booking</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          <div className="sv-footer-col">
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
          <div className="sv-footer-col">
            <h5>Contact us</h5>
            <ul>
              <li><a href="#">afiyacare@gmail.com</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">WhatsApp</a></li>
              <li><a href="/help">Help center</a></li>
            </ul>
            <div className="sv-newsletter">
              <input type="email" placeholder="Your email" />
              <button>&#8594;</button>
            </div>
          </div>
        </div>
        <div className="sv-footer-bottom">
          <p>© 2025 Afiya Care. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
