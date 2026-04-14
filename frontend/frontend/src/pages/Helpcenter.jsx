// pages/Helpcenter.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/HelpCenter.css";

const FAQ = {
  "General": [
    { q: "What is AfiyaCare?", a: "AfiyaCare is a platform that connects patients with certified physiotherapists for in-clinic and at-home sessions across Egypt." },
    { q: "How do I create an account?", a: "Click 'Register' on the homepage, fill in your details and choose whether you're registering as a patient or a doctor." },
    { q: "Is my personal information safe?", a: "Yes. We use industry-standard encryption to protect all your personal data." },
    { q: "Can I use AfiyaCare on mobile?", a: "Yes! AfiyaCare is fully responsive and works seamlessly on mobile, tablet and desktop browsers." },
    { q: "How do I reset my password?", a: "Click 'Forgot password' on the login page, enter your email and we'll send you a reset link." },
  ],
  "Payments & Packages": [
    { q: "What packages are available?", a: "We offer three packages: Single (500 EGP), Progress (3,200 EGP) for 8 sessions, and Athlete (4,000 EGP) for 12 sessions." },
    { q: "What payment methods are accepted?", a: "We accept cash on session, bank transfers, and major credit/debit cards." },
    { q: "Can I get a refund?", a: "Refunds are available if you cancel at least 24 hours before your scheduled appointment." },
    { q: "Are there any hidden fees?", a: "No hidden fees. The price you see is exactly what you pay." },
    { q: "Can I upgrade my package?", a: "Yes, you can upgrade your package at any time by contacting our support team." },
  ],
  "Technical Issues": [
    { q: "I can't log into my account.", a: "Try resetting your password first. If the issue persists, clear your browser cache or try a different browser." },
    { q: "The booking page is not loading doctors.", a: "This may be a temporary server issue. Please refresh the page." },
    { q: "My chat messages aren't sending.", a: "Check your internet connection. If the problem continues, log out and log back in." },
    { q: "I'm not receiving email notifications.", a: "Check your spam folder and make sure the email address on your account is correct." },
    { q: "The app is running slowly.", a: "Try clearing your browser cache and cookies." },
  ],
};

const CONTACT_CHANNELS = [
  { icon: "📞", label: "Phone Call", value: "+20 12345677", href: "tel:+2012345677", color: "#00b4a2" },
  { icon: "📧", label: "Email", value: "afiyacare@gmail.com", href: "mailto:afiyacare@gmail.com", color: "#3b82f6" },
  { icon: "💬", label: "WhatsApp", value: "Chat on WhatsApp", href: "https://wa.me/201014737320", color: "#25d366" },
  { icon: "📘", label: "Facebook", value: "AfiyaCare", href: "https://facebook.com", color: "#1877f2" },
  { icon: "📸", label: "Instagram", value: "@afiyacare", href: "https://instagram.com", color: "#e1306c" },
];

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState("faq");
  const [faqCategory, setFaqCategory] = useState("General");
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="hc-root">
      {/* HERO */}
      <section className="hc-hero">
        <div className="hc-hero-overlay" />
        <div className="hc-hero-content">
          <span className="hc-tag">✦ HELP CENTER</span>
          <h1>How Can We<br /><em>Help You?</em></h1>
          <p>Find answers, get in touch, or browse our FAQ — we're here for you.</p>
          <div className="hc-hero-tabs">
            {[{ key:"faq", icon:"❓", label:"FAQ" }, { key:"contact", icon:"📬", label:"Contact Us" }].map(t => (
              <button key={t.key} className={`hc-hero-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="hc-content">
        {activeTab === "faq" && (
          <section className="hc-faq">
            <div className="hc-faq-sidebar">
              <h3>Categories</h3>
              {Object.keys(FAQ).map(cat => (
                <button key={cat} className={`hc-cat-btn${faqCategory === cat ? " active" : ""}`} onClick={() => { setFaqCategory(cat); setOpenFaq(null); }}>
                  {cat === "General" && "🌐 "}{cat === "Payments & Packages" && "💳 "}{cat === "Technical Issues" && "🔧 "}{cat}
                </button>
              ))}
              <div className="hc-still-stuck">
                <h4>Still stuck?</h4>
                <p>Can't find what you're looking for? Our team is ready to help.</p>
                <button className="hc-btn hc-btn-primary" onClick={() => setActiveTab("contact")}>Contact Us</button>
              </div>
            </div>
            <div className="hc-faq-list">
              <div className="hc-faq-header">
                <h2>{faqCategory}</h2>
                <p>{FAQ[faqCategory].length} questions</p>
              </div>
              {FAQ[faqCategory].map((item, i) => (
                <div key={i} className={`hc-faq-item${openFaq === i ? " open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="hc-faq-q">
                    <span>{item.q}</span>
                    <div className={`hc-faq-arrow${openFaq === i ? " open" : ""}`}>›</div>
                  </div>
                  {openFaq === i && <div className="hc-faq-a">{item.a}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="hc-contact">
            <div className="hc-contact-header">
              <h2>Get in Touch</h2>
              <p>Choose the channel that works best for you. We typically respond within a few hours.</p>
            </div>
            <div className="hc-contact-grid">
              {CONTACT_CHANNELS.map(ch => (
                <a key={ch.label} href={ch.href} target="_blank" rel="noreferrer" className="hc-channel-card">
                  <div className="hc-channel-icon" style={{ background: `${ch.color}18`, color: ch.color }}>{ch.icon}</div>
                  <div className="hc-channel-info"><h4>{ch.label}</h4><p>{ch.value}</p></div>
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
    </div>
  );
}