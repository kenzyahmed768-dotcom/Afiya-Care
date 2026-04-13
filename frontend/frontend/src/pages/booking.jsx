import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Booking.css";
import Logo from "../images/logo.jpeg";

const API = "http://localhost:5000";

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM",
  "04:00 PM","04:30 PM","05:00 PM","05:30 PM",
];

const STEPS = [
  { num:"01", title:"Initial Assessment", desc:"Licensed professionals with years of physiotherapy experience evaluate your condition." },
  { num:"02", title:"Personal Plan",       desc:"Every patient has a personalized plan tailored to their specific needs and goals." },
  { num:"03", title:"Guided Therapy",      desc:"Sessions are supervised to the highest level for safe and effective recovery." },
  { num:"04", title:"Ongoing Support",     desc:"We make sure we are always available to support our patients every step of the way." },
];

const PACKAGES = [
  {
    name: "Single", tag: null, price: "500 EGP",
    features: ["1 personalized physiotherapy session","Full assessment + treatment","Flexible scheduling","In-clinic or at home"],
  },
  {
    name: "Progress", tag: "Most Popular", price: "3,200 EGP",
    features: ["8 sessions","Structured treatment plan","Strength, mobility & pain management","Best value for steady recovery"],
  },
  {
    name: "Athlete", tag: "Best Value", price: "4,000 EGP",
    features: ["12 sessions","Injury prevention & return-to-sport","Advanced rehab & conditioning","Maximum savings"],
  },
];

export default function Booking() {
  const [doctors, setDoctors]               = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate]     = useState("");
  const [selectedTime, setSelectedTime]     = useState("");
  const [bookedSlots, setBookedSlots]       = useState([]);
  const [form, setForm]                     = useState({ name:"", email:"", phone:"", location:"at-clinic", notes:"" });
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [booking, setBooking]               = useState(false);
  const [success, setSuccess]               = useState(false);
  const [error, setError]                   = useState("");
  const [user, setUser]                     = useState(null);
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const dropdownRef = useRef(null);
  const bookingRef  = useRef(null);
  const navigate    = useNavigate();

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    const t = localStorage.getItem("token");
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

  useEffect(() => {
    fetch(`${API}/booking/doctors`)
      .then(r => r.json())
      .then(d => { setDoctors(Array.isArray(d) ? d : []); setLoadingDoctors(false); })
      .catch(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) { setBookedSlots([]); return; }
    fetch(`${API}/booking/slots?doctorId=${selectedDoctor._id}&date=${selectedDate}`)
      .then(r => r.json()).then(d => setBookedSlots(Array.isArray(d) ? d : []))
      .catch(() => setBookedSlots([]));
  }, [selectedDoctor, selectedDate]);

  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  const handleBook = async () => {
    if (!token) { navigate("/login"); return; }
    if (!selectedDoctor || !selectedDate || !selectedTime) { setError("Please select a doctor, date and time slot."); return; }
    if (!form.name || !form.email || !form.phone) { setError("Please fill in your name, email and phone."); return; }
    setBooking(true); setError("");
    try {
      const res = await fetch(`${API}/booking/create`, {
        method:"POST", headers,
        body: JSON.stringify({ doctorId: selectedDoctor._id, date: selectedDate, time: selectedTime, reason: form.notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Booking failed."); return; }
      if (data.appointment) {
        try {
          const uid = JSON.parse(atob(token.split(".")[1])).id;
          await fetch(`${API}/booking/init-chat`, {
            method:"POST", headers,
            body: JSON.stringify({ senderId: uid, receiverId: selectedDoctor._id, appointmentDate: selectedDate, appointmentTime: selectedTime }),
          });
        } catch {}
      }
      setSuccess(true);
    } catch { setError("Could not connect to server."); }
    finally { setBooking(false); }
  };

  const today = new Date().toISOString().split("T")[0];

  if (success) return (
    <div className="bk-root">
      <BkNav user={user} dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} dropdownRef={dropdownRef} handleDashboard={handleDashboard} handleLogout={handleLogout} />
      <div className="bk-success-page">
        <div className="bk-success-card">
          <div className="bk-success-icon">🎉</div>
          <h2>Appointment Booked!</h2>
          <p>Your appointment with <strong>{selectedDoctor?.name}</strong> on <strong>{new Date(selectedDate).toDateString()}</strong> at <strong>{selectedTime}</strong> is confirmed.</p>
          <p className="bk-success-chat">💬 A chat has been started with your doctor — check your dashboard.</p>
          <div className="bk-success-btns">
            <button className="bk-btn bk-btn-primary" onClick={() => navigate("/patient")}>Go to Dashboard</button>
            <button className="bk-btn bk-btn-ghost" onClick={() => { setSuccess(false); setSelectedDoctor(null); setSelectedDate(""); setSelectedTime(""); setForm({ name:"",email:"",phone:"",location:"at-clinic",notes:"" }); }}>Book Another</button>
          </div>
        </div>
      </div>
      <BkFooter />
    </div>
  );

  return (
    <div className="bk-root">
      <BkNav user={user} dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} dropdownRef={dropdownRef} handleDashboard={handleDashboard} handleLogout={handleLogout} />

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="bk-hero">
        <div className="bk-hero-left">
          <span className="bk-tag">Your Healing Path</span>
          <h1>Your Recovery<br /><em>Starts Here</em></h1>
          <p>Book the best in-clinic and at-home physiotherapy with specialists who truly care.</p>
          <button className="bk-btn bk-btn-primary" onClick={scrollToBooking}>Book Now →</button>
        </div>
        <div className="bk-hero-right">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" alt="Physiotherapy session" />
          <div className="bk-hero-float bk-hero-float-1">
            <span>✓</span> 400+ Specialists
          </div>
          <div className="bk-hero-float bk-hero-float-2">
            <span>⭐</span> 98% Satisfaction
          </div>
        </div>
      </section>

      {/* ══ STEPS ═════════════════════════════════════════ */}
      <section className="bk-steps">
        <div className="bk-steps-left">
          <span className="bk-tag bk-tag-dark">Our Healing Path</span>
          <h2>Steps Towards<br /><strong>Lasting Relief</strong></h2>
          <p>Our proven four-step approach ensures every patient gets personalised care at every stage of recovery.</p>
          <button className="bk-btn bk-btn-outline-dark" onClick={scrollToBooking}>Start Today</button>
        </div>
        <div className="bk-steps-grid">
          {STEPS.map((s, i) => (
            <div className="bk-step" key={i}>
              <div className="bk-step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BOOKING FORM ══════════════════════════════════ */}
      <section className="bk-booking" id="booking">
        <div className="bk-booking-img">
          <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80" alt="Booking" />
          <div className="bk-booking-overlay">
            <h3>Back to Comfort</h3>
            <p>Move Without Pain</p>
          </div>
        </div>

        <div className="bk-booking-form" ref={bookingRef}>
          <div className="bk-form-head">
            <h3>Easier Booking, Better Care</h3>
            <p>Fill in your details to book with your chosen specialist.</p>
          </div>

          {/* Doctor */}
          <div className="bk-field">
            <label>Choose Your Doctor *</label>
            {loadingDoctors ? (
              <div className="bk-mini-load"><div className="bk-spin" /><span>Loading...</span></div>
            ) : (
              <select className="bk-input" value={selectedDoctor?._id || ""} onChange={e => { const d = doctors.find(x => x._id === e.target.value); setSelectedDoctor(d || null); setSelectedDate(""); setSelectedTime(""); }}>
                <option value="">Select a doctor…</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}{d.specialty ? ` — ${d.specialty}` : ""}</option>)}
              </select>
            )}
          </div>

          <div className="bk-row">
            <div className="bk-field">
              <label>Full Name *</label>
              <input className="bk-input" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="bk-field">
              <label>Email *</label>
              <input className="bk-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>

          <div className="bk-row">
            <div className="bk-field">
              <label>Phone Number *</label>
              <input className="bk-input" type="tel" placeholder="+20 100 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="bk-field">
              <label>Choose Date *</label>
              <input className="bk-input" type="date" min={today} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }} />
            </div>
          </div>

          <div className="bk-field">
            <label>At home or in clinic</label>
            <select className="bk-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              <option value="at-clinic">At clinic</option>
              <option value="at-home">At home</option>
            </select>
          </div>

          {selectedDoctor && selectedDate && (
            <div className="bk-field">
              <label>Available Time Slots *</label>
              <div className="bk-slots">
                {TIME_SLOTS.map(slot => {
                  const taken = bookedSlots.includes(slot);
                  return (
                    <button key={slot}
                      className={`bk-slot${selectedTime === slot ? " active" : ""}${taken ? " taken" : ""}`}
                      onClick={() => !taken && setSelectedTime(slot)}
                      disabled={taken}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bk-field">
            <label>Describe the injury or the issue</label>
            <textarea className="bk-input bk-textarea" rows={3} placeholder="Tell us about your symptoms..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {error && <div className="bk-error">{error}</div>}

          <button className="bk-btn bk-btn-primary bk-btn-full" onClick={handleBook} disabled={booking}>
            {booking ? "Booking..." : "Book Now!"}
          </button>
          <p className="bk-chat-note">💬 A chat with your doctor starts automatically after booking.</p>
        </div>
      </section>

      {/* ══ PACKAGES ══════════════════════════════════════ */}
      <section className="bk-packages">
        <div className="bk-pkg-header">
          <span className="bk-tag bk-tag-dark">Care Made Affordable</span>
          <h2>Payment Packages</h2>
          <p>Choose the plan that fits your recovery journey and budget.</p>
        </div>
        <div className="bk-pkg-grid">
          {PACKAGES.map((pkg, i) => (
            <div className={`bk-pkg${i === 1 ? " bk-pkg-featured" : ""}`} key={pkg.name}>
              {pkg.tag && <div className="bk-pkg-badge">{pkg.tag}</div>}
              <h3>{pkg.name}</h3>
              <ul>
                {pkg.features.map(f => <li key={f}><span className="bk-check">✓</span>{f}</li>)}
              </ul>
              <div className="bk-pkg-price">{pkg.price}</div>
              <button className={`bk-btn ${i === 1 ? "bk-btn-primary" : "bk-btn-outline-dark"}`} onClick={scrollToBooking}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CONTACT ═══════════════════════════════════════ */}
      <section className="bk-contact">
        <div className="bk-contact-tag">
          <span className="bk-tag bk-tag-dark">We're Here When You Need Us</span>
          <h2>Get in Touch</h2>
        </div>
        <div className="bk-contact-grid">
          <div className="bk-contact-img">
            <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&q=80" alt="Contact" />
          </div>
          <div className="bk-contact-cards">
            <div className="bk-contact-card">
              <h4>Contact us!</h4>
              <div className="bk-contact-row"><span>📞</span><p>+20 12345677</p></div>
              <div className="bk-contact-row"><span>📧</span><p>afiyacare@gmail.com</p></div>
            </div>
            <div className="bk-contact-card">
              <h4>Opening Hours <span>🕐</span></h4>
              <div className="bk-hours">
                <div><span>Sunday – Thursday</span><strong>8:00 AM – 6:00 PM</strong></div>
                <div><span>Friday</span><strong>8:00 AM – 2:30 PM</strong></div>
                <div><span>Saturday</span><strong>8:30 AM – 3:30 PM</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BkFooter />
    </div>
  );
}

function BkNav({ user, dropdownOpen, setDropdownOpen, dropdownRef, handleDashboard, handleLogout }) {
  return (
    <nav className="bk-nav">
      <a href="/" className="logo"><img src={Logo} alt="AfiyaCare" className="logo-img" /></a>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#">About Us</a></li>
        <li><a href="/join">Join us</a></li>
        <li><a href="/booking" className="active">Booking</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Blog</a></li>
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
  );
}

function BkFooter() {
  return (
    <footer className="bk-footer">
      <div className="bk-footer-grid">
        <div className="bk-footer-brand">
          <a href="/" className="logo">
            <img src={Logo} alt="AfiyaCare" className="logo-img" />
            <span className="bk-brand-name">AFIYA<em>CARE</em></span>
          </a>
          <p>At Afiya Care, we provide expert physiotherapy services designed to restore movement, reduce pain, and support overall wellness.</p>
        </div>
        <div className="bk-footer-col"><h5>Quick Links</h5><ul>
              <li><a href="/">Home</a></li>
              <li><a href="/About us">About us</a></li>
              <li><a href="/join ">Join us</a></li>
              <li><a href="/booking">Booking</a></li>
              <li><a href="/Services">Services</a></li>
              <li><a href="/Blog">Blog</a></li>
            
            </ul></div>
        <div className="bk-footer-col"><h5>Services</h5><ul>{["Orthopedic Physiotherapy","Sports Injury","Surgical Rehabilitation","Cardiac Rehab","Elderly Care","Home Lab Tests"].map(s => <li key={s}><a href="#">{s}</a></li>)}</ul></div>
        <div className="bk-footer-col">
          <h5>Contact us</h5>
          <ul><li><a href="#">afiyacare@gmail.com</a></li><li><a href="#">Facebook</a></li><li><a href="#">Instagram</a></li><li><a href="#">WhatsApp</a></li>  <li><a href="/help">Help center</a></li></ul> 
          <div className="bk-newsletter"><input type="email" placeholder="Your email" /><button>→</button></div>
        </div>
      </div>
      <div className="bk-footer-bottom">
        <div className="bk-socials"><a href="#">f</a><a href="#">t</a><a href="#">in</a></div>
        <p>©️ 2025 Afiya Care. All Rights Reserved.</p>
      </div>
    </footer>
  );
}