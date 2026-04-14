// pages/JoinUs.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/joinus.css";

const API = "http://localhost:5000";

const SPECIALISTS = [
  { name: "Dr. Amara Osei", title: "Cardiologist", emoji: "👨‍⚕️", rating: "4.9", stars: "★★★★★", reviews: 312 },
  { name: "Dr. Fatima Noor", title: "Dermatologist", emoji: "👩‍⚕️", rating: "4.8", stars: "★★★★★", reviews: 278 },
  { name: "Dr. Kwame Ansah", title: "Neurologist", emoji: "🧑‍⚕️", rating: "4.9", stars: "★★★★★", reviews: 196 },
  { name: "Dr. Lena Boateng", title: "Pediatrician", emoji: "👩‍⚕️", rating: "5.0", stars: "★★★★★", reviews: 401 },
  { name: "Dr. Yusuf Musa", title: "Orthopedic Surgeon", emoji: "👨‍⚕️", rating: "4.7", stars: "★★★★☆", reviews: 223 },
  { name: "Dr. Aisha Diallo", title: "Oncologist", emoji: "👩‍⚕️", rating: "4.9", stars: "★★★★★", reviews: 187 },
];

const PERKS = [
  "Over 400 leading hospitals and clinics",
  "Trusted doctors across 20+ specialties",
  "Online consultations 24/7×365",
  "Award-winning practice management",
  "In the mission of improving health",
  "Feel like you are at Home Services",
];

const ROLES = [
  "Physiotherapist", "Physician / Doctor", "Nurse Practitioner",
  "Medical Assistant", "Administrative Staff", "Lab Technician", "Other",
];

const VISIBLE = 3;

export default function JoinUs() {
  const [slide, setSlide] = useState(0);
  const maxSlide = SPECIALISTS.length - VISIBLE;
  const emptyForm = { firstName: "", lastName: "", email: "", phone: "", role: "", experience: "", message: "", agree: false };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  const goTo = (n) => setSlide(Math.max(0, Math.min(n, maxSlide)));

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors(err => ({ ...err, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.role) e.role = "Please select a role";
    if (!form.agree) e.agree = "You must agree to continue";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone, role: form.role,
          experience: form.experience, message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.message || "Something went wrong."); return; }
      setSubmitted(true);
    } catch {
      setSubmitError("Could not connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => { setForm(emptyForm); setErrors({}); setSubmitted(false); setSubmitError(""); };

  return (
    <>
      {/* HERO */}
      <section className="join-hero">
        <div className="join-hero-overlay" />
        <div className="join-hero-content">
          <div className="section-label">JOIN THE TEAM</div>
          <h1>Build Your Career<br /><em>With AfiyaCare</em></h1>
          <p>Be part of a passionate team dedicated to transforming lives through expert physiotherapy care.</p>
          <a href="#apply" className="btn-secondary">Apply Now</a>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="story-section" id="story">
        <div className="story-image">
          <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&q=80" alt="AfiyaCare Team" />
          <div className="story-badge">Est. 2012</div>
        </div>
        <div className="story-content">
          <div className="section-label">OUR STORY</div>
          <h2>We've been in business<br /><em>since 2012.</em></h2>
          <p>AfiyaCare has proudly served communities across the region since 2012, growing alongside our ever-expanding population.</p>
          <p>Our medical staffing includes highly qualified professionals and specialists licensed across more than 100 convenient locations nationwide.</p>
          <div className="story-highlights">
            {[["🌍","100+ Locations"],["🩺","20+ Specialties"],["⭐","Award-Winning Care"]].map(([icon, label]) => (
              <div className="story-highlight" key={label}><span>{icon}</span><p>{label}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mission-section" id="mission">
        <div className="mission-content">
          <div className="section-label">OUR MISSION</div>
          <h2>Our mission is to help<br /><em>patients live better.</em></h2>
          <p>Our team of highly trained professionals uses the latest healing technologies to restore your health quickly and safely.</p>
          <p>Our mission is to improve the health of our community by providing high-quality, comprehensive care in a welcoming and compassionate environment.</p>
          <a href="#apply" className="btn-mission" style={{ marginTop: "1rem", display: "inline-flex" }}>Join Our Mission</a>
        </div>
        <div className="mission-image">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80" alt="AfiyaCare Mission" />
          <div className="mission-ring" />
        </div>
      </section>

      {/* QUALIFIED TEAM */}
      <section className="team-section">
        <div className="team-inner">
          <div className="section-label">BEST MEDICAL TREATMENT</div>
          <h2>Our Qualified Team is Always<br /><em>Ready to Help You!</em></h2>
          <div className="team-grid">
            <div className="team-quote-card">
              <span className="team-quote-icon">"</span>
              <p>Our mission is to improve the health of our community by providing high quality, comprehensive physiotherapy care in a welcoming & compassionate environment.</p>
              <div className="team-doctor">
                <div className="team-doctor-avatar">👨‍⚕️</div>
                <div><strong>Dr. James Afiya</strong><span>Lead Physiotherapist, MRCP (UK)</span></div>
              </div>
              <div className="team-badge-247"><span>🎧</span><strong>24/7</strong><span>Service</span></div>
            </div>
            <div className="team-perks">
              <h3>Experienced in multiple medical services</h3>
              <ul>{PERKS.map(p => <li key={p}><span className="perk-dot">✦</span>{p}</li>)}</ul>
              <a href="/booking" className="btn-outline">Book an Appointment</a>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALISTS SLIDER */}
      <section className="specialists-section" id="specialists">
        <div className="section-label">OUR DOCTORS</div>
        <h2>Meet Our <em>Specialists</em></h2>
        <p className="specialists-sub">World-class physicians dedicated to your care and wellbeing.</p>
        <div className="specialists-slider">
          <button className="slider-arrow" onClick={() => goTo(slide - 1)} disabled={slide === 0}>←</button>
          <div className="specialists-track">
            {SPECIALISTS.slice(slide, slide + VISIBLE).map((s) => (
              <div className="specialist-card" key={s.name}>
                <div className="specialist-avatar">{s.emoji}</div>
                <div className="specialist-rating">{s.stars} <span>{s.rating}</span></div>
                <h4>{s.name}</h4>
                <p>{s.title}</p>
                <p className="specialist-reviews">{s.reviews} patient reviews</p>
                <a href="#apply" className="btn-card">View Profile →</a>
              </div>
            ))}
          </div>
          <button className="slider-arrow" onClick={() => goTo(slide + 1)} disabled={slide === maxSlide}>→</button>
        </div>
        <div className="slider-dots">
          {Array.from({ length: maxSlide + 1 }).map((_, i) => (
            <button key={i} className={`slider-dot${i === slide ? " active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>
      </section>

      {/* APPLY NOW */}
      <section className="apply-section" id="apply">
        <div className="apply-header">
          <div className="section-label">JOIN THE TEAM</div>
          <h2>Apply Now & Start<br /><em>Making a Difference</em></h2>
          <p>Ready to bring your skills to AfiyaCare? Fill out the form below and let's connect.</p>
        </div>
        {submitted ? (
          <div className="apply-success">
            <div className="success-icon">🎉</div>
            <h2>Application Received!</h2>
            <p>Thank you, <strong>{form.firstName}</strong>! Our team will review your application and get back to you within 3–5 business days.</p>
            <button className="btn-primary" onClick={resetForm}>Submit Another</button>
          </div>
        ) : (
          <form className="apply-form" onSubmit={onSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label>First Name *</label>
                <input type="text" name="firstName" placeholder="e.g. Amara" value={form.firstName} onChange={onChange} className={errors.firstName ? "input-error" : ""} />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>
              <div className="form-field">
                <label>Last Name *</label>
                <input type="text" name="lastName" placeholder="e.g. Osei" value={form.lastName} onChange={onChange} className={errors.lastName ? "input-error" : ""} />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Email Address *</label>
                <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} className={errors.email ? "input-error" : ""} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="+20 100 000 0000" value={form.phone} onChange={onChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Role Applying For *</label>
                <select name="role" value={form.role} onChange={onChange} className={errors.role ? "input-error" : ""}>
                  <option value="">Select a role...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.role && <span className="field-error">{errors.role}</span>}
              </div>
              <div className="form-field">
                <label>Years of Experience</label>
                <select name="experience" value={form.experience} onChange={onChange}>
                  <option value="">Select...</option>
                  <option>0–1 years</option>
                  <option>2–4 years</option>
                  <option>5–9 years</option>
                  <option>10+ years</option>
                </select>
              </div>
            </div>
            <div className="form-field form-field-full">
              <label>Why do you want to join AfiyaCare?</label>
              <textarea name="message" rows={4} placeholder="Tell us about your passion for patient care..." value={form.message} onChange={onChange} />
            </div>
            <div className="form-field form-field-full form-checkbox">
              <label className="check-label">
                <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
                <span>I agree to AfiyaCare's <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.</span>
              </label>
              {errors.agree && <span className="field-error">{errors.agree}</span>}
            </div>
            {submitError && <div className="submit-error">{submitError}</div>}
            <div className="form-submit-row">
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application ✦"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* STATS */}
      <section className="stats-section">
        {[["👤","1.5M+","Patients Served"],["📅","2M+","Appointments Booked"],["🏆","300K+","Successful Treatments"],["🏥","400+","Hospitals & Clinics"]].map(([icon, value, label]) => (
          <div className="stat-item" key={label}>
            <span className="stat-icon">{icon}</span>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>
    </>
  );
}