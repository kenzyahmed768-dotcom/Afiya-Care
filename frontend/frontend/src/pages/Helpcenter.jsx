import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/HelpCenter.css";
import Logo from "../images/logo.jpeg";

/* ── FAQ DATA ─────────────────────────────────────────────── */
const FAQ = {
  "General": [
    { q: "What is AfiyaCare?", a: "AfiyaCare is a platform that connects patients with certified physiotherapists for in-clinic and at-home sessions across Egypt." },
    { q: "How do I create an account?", a: "Click 'Register' on the homepage, fill in your details and choose whether you're registering as a patient or a doctor." },
    { q: "Is my personal information safe?", a: "Yes. We use industry-standard encryption to protect all your personal data. We never share your information with third parties." },
    { q: "Can I use AfiyaCare on mobile?", a: "Yes! AfiyaCare is fully responsive and works seamlessly on mobile, tablet and desktop browsers." },
    { q: "How do I reset my password?", a: "Click 'Forgot password' on the login page, enter your email and we'll send you a reset link within a few minutes." },
  ],
  "Payments & Packages": [
    { q: "What packages are available?", a: "We offer three packages: Single (500 EGP) for one session, Progress (3,200 EGP) for 8 sessions, and Athlete (4,000 EGP) for 12 sessions." },
    { q: "What payment methods are accepted?", a: "We accept cash on session, bank transfers, and major credit/debit cards. Payment details are confirmed at booking." },
    { q: "Can I get a refund?", a: "Refunds are available if you cancel at least 24 hours before your scheduled appointment. Contact support for assistance." },
    { q: "Are there any hidden fees?", a: "No hidden fees. The price you see on the package page is exactly what you pay. Home visit sessions may include a small travel fee." },
    { q: "Can I upgrade my package?", a: "Yes, you can upgrade your package at any time by contacting our support team or visiting your patient dashboard." },
  ],
  "Technical Issues": [
    { q: "I can't log into my account. What should I do?", a: "Try resetting your password first. If the issue persists, clear your browser cache or try a different browser. Contact support if it still doesn't work." },
    { q: "The booking page is not loading doctors.", a: "This may be a temporary server issue. Please refresh the page. If doctors still don't appear, contact our support team." },
    { q: "My chat messages aren't sending.", a: "Check your internet connection. If the problem continues, log out and log back in to reconnect to the chat server." },
    { q: "I'm not receiving email notifications.", a: "Check your spam folder. Make sure the email address on your account is correct. Add afiyacare@gmail.com to your contacts." },
    { q: "The app is running slowly.", a: "Try clearing your browser cache and cookies. Make sure you're using an up-to-date browser like Chrome or Firefox." },
  ],
};

const CONTACT_CHANNELS = [
  { icon: "📞", label: "Phone Call",  value: "+20 12345677",          href: "tel:+2012345677",                     color: "#00b4a2" },
  { icon: "📧", label: "Email",       value: "afiyacare@gmail.com",   href: "mailto:afiyacare@gmail.com",           color: "#3b82f6" },
  { icon: "💬", label: "WhatsApp",    value: "Chat on WhatsApp",      href: "https://wa.me/201014737320",           color: "#25d366" },
  { icon: "📘", label: "Facebook",    value: "AfiyaCare",             href: "https://facebook.com",                 color: "#1877f2" },
  { icon: "📸", label: "Instagram",   value: "@afiyacare",            href: "https://instagram.com",                color: "#e1306c" },
];

/* ── MAIN COMPONENT ───────────────────────────────────────── */
export default function HelpCenter() {
  const [activeTab, setActiveTab]       = useState("faq");
  const [faqCategory, setFaqCategory]   = useState("General");
  const [openFaq, setOpenFaq]           = useState(null);
  const [user, setUser]                 = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  /* ── Auth ── */
  useEffect(() => {
    const t    = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("userName");
    if (t && role) setUser({ role, name });
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleDashboard = () => {
    setDropdownOpen(false);
    if (user?.role === "admin") navigate("/admin");
    else if (user?.role === "doctor") navigate("/doctor");
    else navigate("/patient");
  };

  const handleLogout = () => {
    ["token","role","userName","userEmail"].forEach(k => localStorage.removeItem(k));
    setUser(null); setDropdownOpen(false);
  };

  /* ── RENDER ── */
  return (
    <div className="hc-root">

      {/* NAV */}
      <nav className="hc-nav">
        <a href="/" className="logo"><img src={Logo} alt="AfiyaCare" className="logo-img" /></a>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="#">About Us</a></li>
          <li><a href="/join">Join us</a></li>
          <li><a href="/booking">Booking</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="/help" className="active">Help</a></li>
          {user ? (
            <li className="profile-nav-item" ref={dropdownRef}>
              <button className="profile-icon-btn" onClick={() => setDropdownOpen(o => !o)}>
                <div className="profile-icon-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
                <span className="profile-icon-name">{user.name?.split(" ")[0]}</span>
                <svg className={`profile-chevron${dropdownOpen ? " open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="profile-dropdown-name">{user.name}</div>
                      <div className={`profile-dropdown-role ${user.role}`}>{user.role}</div>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={handleDashboard}><span>🏠</span> My Dashboard</button>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item logout" onClick={handleLogout}><span>🚪</span> Logout</button>
                </div>
              )}
            </li>
          ) : (
            <li><a href="/login" className="btn-nav">Login</a></li>
          )}
        </ul>
      </nav>

      {/* HERO */}
      <section className="hc-hero">
        <div className="hc-hero-overlay" />
        <div className="hc-hero-content">
          <span className="hc-tag">✦ HELP CENTER</span>
          <h1>How Can We<br /><em>Help You?</em></h1>
          <p>Find answers, get in touch, or browse our FAQ — we're here for you.</p>
          <div className="hc-hero-tabs">
            {[
              { key:"faq",     icon:"❓", label:"FAQ" },
              { key:"contact", icon:"📬", label:"Contact Us" },
            ].map(t => (
              <button
                key={t.key}
                className={`hc-hero-tab${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="hc-content">

        {/* ══ FAQ ══════════════════════════════════════════ */}
        {activeTab === "faq" && (
          <section className="hc-faq">
            <div className="hc-faq-sidebar">
              <h3>Categories</h3>
              {Object.keys(FAQ).map(cat => (
                <button
                  key={cat}
                  className={`hc-cat-btn${faqCategory === cat ? " active" : ""}`}
                  onClick={() => { setFaqCategory(cat); setOpenFaq(null); }}
                >
                  {cat === "General"            && "🌐 "}
                  {cat === "Payments & Packages" && "💳 "}
                  {cat === "Technical Issues"    && "🔧 "}
                  {cat}
                </button>
              ))}

              <div className="hc-still-stuck">
                <h4>Still stuck?</h4>
                <p>Can't find what you're looking for? Our team is ready to help.</p>
                <button className="hc-btn hc-btn-primary" onClick={() => setActiveTab("contact")}>
                  Contact Us
                </button>
              </div>
            </div>

            <div className="hc-faq-list">
              <div className="hc-faq-header">
                <h2>{faqCategory}</h2>
                <p>{FAQ[faqCategory].length} questions</p>
              </div>
              {FAQ[faqCategory].map((item, i) => (
                <div
                  key={i}
                  className={`hc-faq-item${openFaq === i ? " open" : ""}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="hc-faq-q">
                    <span>{item.q}</span>
                    <div className={`hc-faq-arrow${openFaq === i ? " open" : ""}`}>›</div>
                  </div>
                  {openFaq === i && (
                    <div className="hc-faq-a">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ CONTACT ══════════════════════════════════════ */}
        {activeTab === "contact" && (
          <section className="hc-contact">
            <div className="hc-contact-header">
              <h2>Get in Touch</h2>
              <p>Choose the channel that works best for you. We typically respond within a few hours.</p>
            </div>
            <div className="hc-contact-grid">
              {CONTACT_CHANNELS.map(ch => (
                <a key={ch.label} href={ch.href} target="_blank" rel="noreferrer" className="hc-channel-card">
                  <div className="hc-channel-icon" style={{ background: `${ch.color}18`, color: ch.color }}>
                    {ch.icon}
                  </div>
                  <div className="hc-channel-info">
                    <h4>{ch.label}</h4>
                    <p>{ch.value}</p>
                  </div>
                  <div className="hc-channel-arrow">→</div>
                </a>
              ))}
            </div>

            <div className="hc-hours-card">
              <h3>🕐 Support Hours</h3>
              <div className="hc-hours-grid">
                <div><span>Sunday – Thursday</span><strong>8:00 AM – 6:00 PM</strong></div>
                <div><span>Friday</span><strong>8:00 AM – 2:30 PM</strong></div>
                <div><span>Saturday</span><strong>8:30 AM – 3:30 PM</strong></div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* FOOTER */}
      <footer>
                   <div className="footer-grid">
                     <div className="footer-brand">
                       <a href="#" className="logo">
                         <img src={Logo} alt="AfiyaCare Logo" className="logo-img" />
                         <div className="logo-icon footer-logo-icon">AC</div>
                        <span className="bk-brand-name">AFIYA<em>CARE</em></span>
                       </a>
                       <p>At Afiya Care, we provide expert physiotherapy services designed to restore movement, reduce pain, and support overall wellness.</p>
                     </div>
                     <div className="footer-col">
                       <h5>Quick Links</h5>
                       <ul>
                         <li><a href="/Home">Home</a></li>
                         <li><a href="/About us">About us</a></li>
                         <li><a href="/join ">Join us</a></li>
                         <li><a href="/Booking">Booking</a></li>
                         <li><a href="/Services">Services</a></li>
                         <li><a href="/Blog">Blog</a></li>
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
                         <li><a href="/help">Help center</a></li>
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
    </div>
  );
}