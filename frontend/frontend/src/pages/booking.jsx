
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Booking.css";
const API = "http://localhost:5000";

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM",
  "04:00 PM","04:30 PM","05:00 PM","05:30 PM",
];

const STEPS = [
  { num:"01", title:"Initial Assessment", desc:"Licensed professionals with years of physiotherapy experience evaluate your condition." },
  { num:"02", title:"Personal Plan", desc:"Every patient has a personalized plan tailored to their specific needs and goals." },
  { num:"03", title:"Guided Therapy", desc:"Sessions are supervised to the highest level for safe and effective recovery." },
  { num:"04", title:"Ongoing Support", desc:"We make sure we are always available to support our patients every step of the way." },
];

const PACKAGES = [
  { name: "Single", tag: null, price: "500 EGP", originalPrice: "600 EGP", discount: "17% OFF", features: ["1 personalized physiotherapy session","Full assessment + treatment","Flexible scheduling","In-clinic or at home"] },
  { name: "Progress", tag: "Most Popular", price: "3,200 EGP", originalPrice: "4,000 EGP", discount: "20% OFF", features: ["8 sessions","Structured treatment plan","Strength, mobility & pain management","Best value for steady recovery"] },
  { name: "Athlete", tag: "Best Value", price: "4,000 EGP", originalPrice: "5,500 EGP", discount: "27% OFF", features: ["12 sessions","Injury prevention & return-to-sport","Advanced rehab & conditioning","Maximum savings"] },
];

const SERVICE_TYPES = [
  { value: "physiotherapy", label: "Physiotherapy", icon: "🩺" },
  { value: "home-lab", label: "Home Lab Tests", icon: "🧪" },
  { value: "consultation", label: "Consultation", icon: "📋" },
];

const CONSULTATION_TYPES = [
  { value: "phone", label: "📞 Phone Consultation" },
  { value: "video", label: "📹 Video Consultation" },
];

const LABS = [
  { id: "hassan-lab", name: "Hassan Lab", address: "15 El-Horreya Rd, Azarita, Alexandria, Egypt", phone: "+20 3 123 4567" },
  { id: "assfra-lab", name: "Assfra Lab", address: "42 Port Said St, Sidi Gaber, Alexandria, Egypt", phone: "+20 3 987 6543" },
];

const formatDoctorName = (doctor) => {
  if (doctor.name && doctor.name !== doctor.email?.split('@')[0]) return doctor.name;
  const emailName = doctor.email?.split('@')[0] || "Doctor";
  return emailName.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export default function Booking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState({ name:"", email:"", phone:"", location:"at-clinic", notes:"", address:"" });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [serviceType, setServiceType] = useState("physiotherapy");
  const [consultationType, setConsultationType] = useState("phone");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const bookingRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const isConsultation = serviceType === "consultation";
  const isHomeLab = serviceType === "home-lab";

  const getAmount = () => {
    if (selectedPackage) {
      if (selectedPackage.name === "Single") return 500;
      if (selectedPackage.name === "Progress") return 3200;
      if (selectedPackage.name === "Athlete") return 4000;
    }
    return 500;
  };

  useEffect(() => {
    fetch(`${API}/booking/doctors`)
      .then(r => r.json())
      .then(d => { setDoctors(Array.isArray(d) ? d : []); setLoadingDoctors(false); })
      .catch(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate || isHomeLab) { setBookedSlots([]); return; }
    fetch(`${API}/booking/slots?doctorId=${selectedDoctor._id}&date=${selectedDate}`)
      .then(r => r.json()).then(d => setBookedSlots(Array.isArray(d) ? d : []))
      .catch(() => setBookedSlots([]));
  }, [selectedDoctor, selectedDate, isHomeLab]);

  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  const handleBook = async () => {
    if (!token) { navigate("/login"); return; }

    if (isHomeLab) {
      if (!selectedLab) { setError("Please select a lab."); return; }
    } else {
      if (!selectedDoctor) { setError("Please select a doctor."); return; }
    }

    if (!selectedDate || !selectedTime) { setError("Please select a date and time slot."); return; }
    if (!form.name || !form.email || !form.phone) { setError("Please fill in your name, email and phone."); return; }

    if ((isHomeLab || form.location === "at-home") && !isConsultation && !form.address) {
      setError("Please provide your address for at-home visits.");
      return;
    }

    const effectivePayment = isConsultation ? "visa" : paymentMethod;

    if (effectivePayment === "visa") {
      const bookingData = {
        doctorId: isHomeLab ? null : selectedDoctor._id,
        doctorName: isHomeLab ? selectedLab.name : formatDoctorName(selectedDoctor),
        specialty: isHomeLab ? "Laboratory" : selectedDoctor.specialty,
        labId: isHomeLab ? selectedLab.id : null,
        labName: isHomeLab ? selectedLab.name : null,
        labAddress: isHomeLab ? selectedLab.address : null,
        date: selectedDate,
        time: selectedTime,
        location: isConsultation ? "consultation" : isHomeLab ? "at-home" : form.location,
        address: isHomeLab ? selectedLab.address : form.address,
        notes: form.notes,
        patientName: form.name,
        patientEmail: form.email,
        patientPhone: form.phone,
        amount: getAmount(),
        serviceType,
        consultationType,
        packageName: selectedPackage?.name || "Single",
        paymentMethod: "visa",
      };
      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));
      navigate("/payment");
      return;
    }

    setBooking(true); setError("");
    try {
      const res = await fetch(`${API}/booking/create`, {
        method:"POST", headers,
        body: JSON.stringify({
          doctorId: isHomeLab ? null : selectedDoctor._id,
          labId: isHomeLab ? selectedLab.id : null,
          labName: isHomeLab ? selectedLab.name : null,
          labAddress: isHomeLab ? selectedLab.address : null,
          date: selectedDate,
          time: selectedTime,
          reason: form.notes,
          paymentMethod: "cash",
          location: isHomeLab ? "at-home" : form.location,
          address: isHomeLab ? selectedLab.address : form.address,
          serviceType,
          consultationType,
          packageName: selectedPackage?.name || "Single",
          amount: getAmount(),
          patientName: form.name,
          patientEmail: form.email,
          patientPhone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Booking failed."); return; }
      if (data.appointment && !isHomeLab) {
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

  const resetForm = () => {
    setSuccess(false); setSelectedDoctor(null); setSelectedLab(null);
    setSelectedDate(""); setSelectedTime(""); setPaymentMethod("cash");
    setSelectedPackage(null); setServiceType("physiotherapy"); setConsultationType("phone");
    setForm({ name:"", email:"", phone:"", location:"at-clinic", notes:"", address:"" });
  };

  if (success) return (
    <div className="bk-root">
      <div className="bk-success-page">
        <div className="bk-success-card">
          <div className="bk-success-icon">🎉</div>
          <h2>Appointment Booked!</h2>
          <p>
            Your {serviceType.replace("-", " ")} appointment with{" "}
            <strong>{isHomeLab ? selectedLab.name : formatDoctorName(selectedDoctor)}</strong>{" "}
            on <strong>{new Date(selectedDate).toDateString()}</strong> at <strong>{selectedTime}</strong> is confirmed.
          </p>
          {isHomeLab && (
            <p className="bk-success-address">📍 <strong>Lab address:</strong> {selectedLab.address}</p>
          )}
          {!isHomeLab && form.location === "at-home" && form.address && (
            <p className="bk-success-address">📍 <strong>Address:</strong> {form.address}</p>
          )}
          {paymentMethod === "cash" && !isConsultation && (
            <p className="bk-success-payment">💵 Please have <strong>{getAmount()} EGP</strong> ready for the doctor.</p>
          )}
          <p className="bk-success-chat">📧 A confirmation email with your invoice has been sent to <strong>{form.email}</strong></p>
          {!isHomeLab && !isConsultation && (
            <p className="bk-success-chat">💬 A chat has been started with your doctor — check your dashboard.</p>
          )}
          <div className="bk-success-btns">
            <button className="bk-btn bk-btn-primary" onClick={() => navigate("/patient")}>Go to Dashboard</button>
            <button className="bk-btn bk-btn-ghost" onClick={resetForm}>Book Another</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bk-root">

      <section className="bk-hero">
        <div className="bk-hero-left">
          <span className="bk-tag">Your Healing Path</span>
          <h1>Your Recovery<br /><em>Starts Here</em></h1>
          <p>Book the best in-clinic and at-home physiotherapy with specialists who truly care.</p>
          <button className="bk-btn bk-btn-primary" onClick={scrollToBooking}>Book Now →</button>
        </div>
        <div className="bk-hero-right">
          <img src="https://img.freepik.com/free-photo/team-young-nurses-learning-practice-from-doctor-expert-cabinet_482257-113728.jpg?semt=ais_hybrid&w=740&q=80" alt="Physiotherapy session" />
          <div className="bk-hero-float bk-hero-float-1"><span>✓</span> 30+ Specialists</div>
          <div className="bk-hero-float bk-hero-float-2"><span>⭐</span> 98% Satisfaction</div>
        </div>
      </section>

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

      <section className="bk-booking" id="booking">
        <div className="bk-booking-img">
          <img src="https://www.thomsonreuters.com/en-us/posts/wp-content/uploads/sites/20/2021/09/healthcare-professionals.jpg" alt="Booking" />
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

          {/* Service Type */}
          <div className="bk-field">
            <label>Service Type *</label>
            <div className="bk-service-types">
              {SERVICE_TYPES.map(st => (
                <button
                  key={st.value}
                  className={`bk-service-type-btn ${serviceType === st.value ? "active" : ""}`}
                  onClick={() => {
                    setServiceType(st.value);
                    setConsultationType("phone");
                    setSelectedDoctor(null);
                    setSelectedLab(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    if (st.value === "home-lab") {
                      setForm(f => ({ ...f, location: "at-home" }));
                    } else {
                      setForm(f => ({ ...f, location: "at-clinic" }));
                    }
                  }}
                  type="button"
                >
                  <span className="bk-service-icon">{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Type */}
          {isConsultation && (
            <div className="bk-field">
              <label>Consultation Type *</label>
              <select className="bk-input" value={consultationType} onChange={e => setConsultationType(e.target.value)}>
                {CONSULTATION_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Doctor OR Lab selector */}
          {isHomeLab ? (
            <div className="bk-field">
              <label>Choose a Lab (Alexandria) *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {LABS.map(lab => (
                  <button
                    key={lab.id}
                    type="button"
                    className={`bk-service-type-btn${selectedLab?.id === lab.id ? " active" : ""}`}
                    style={{ flexDirection: "column", alignItems: "flex-start", padding: "12px 16px", borderRadius: "10px" }}
                    onClick={() => setSelectedLab(lab)}
                  >
                    <span style={{ fontWeight: 600, fontSize: ".9rem" }}>🧪 {lab.name}</span>
                    <span style={{ fontSize: ".75rem", opacity: 0.75, marginTop: "3px" }}>📍 {lab.address}</span>
                    <span style={{ fontSize: ".75rem", opacity: 0.75 }}>📞 {lab.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bk-field">
              <label>Choose Your Doctor *</label>
              {loadingDoctors ? (
                <div className="bk-mini-load"><div className="bk-spin" /><span>Loading doctors...</span></div>
              ) : (
                <select className="bk-input" value={selectedDoctor?._id || ""} onChange={e => { const d = doctors.find(x => x._id === e.target.value); setSelectedDoctor(d || null); setSelectedDate(""); setSelectedTime(""); }}>
                  <option value="">Select a doctor...</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {formatDoctorName(d)}{d.specialty ? ` — ${d.specialty}` : ""}</option>
                  ))}
                </select>
              )}
            </div>
          )}

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

          {/* Location — only for physiotherapy */}
          {!isHomeLab && !isConsultation && (
            <div className="bk-field">
              <label>At home or in clinic</label>
              <select className="bk-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
                <option value="at-clinic">At clinic</option>
                <option value="at-home">At home</option>
              </select>
            </div>
          )}

          {/* Address for at-home physiotherapy */}
          {!isHomeLab && !isConsultation && form.location === "at-home" && (
            <div className="bk-field">
              <label>Home Address *</label>
              <textarea className="bk-input bk-textarea" rows={2} placeholder="Enter your full address..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          )}

          {/* Time slots */}
          {(isHomeLab ? selectedLab : selectedDoctor) && selectedDate && (
            <div className="bk-field">
              <label>Available Time Slots *</label>
              <div className="bk-slots">
                {TIME_SLOTS.map(slot => {
                  const taken = !isHomeLab && bookedSlots.includes(slot);
                  return (
                    <button key={slot} className={`bk-slot${selectedTime === slot ? " active" : ""}${taken ? " taken" : ""}`} onClick={() => !taken && setSelectedTime(slot)} disabled={taken}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bk-field">
            <label>Describe the issue or reason for visit</label>
            <textarea className="bk-input bk-textarea" rows={3} placeholder="Tell us about your symptoms or reason for booking..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {/* Payment */}
          <div className="bk-field">
            <label>Payment Method *</label>
            {isConsultation ? (
              <div className="bk-visa-only-box">
                <span className="bk-visa-only-icon">💳</span>
                <span>Visa Card — Required for all consultations</span>
              </div>
            ) : (
              <select className="bk-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">💵 Cash — Pay when the doctor arrives</option>
                <option value="visa">💳 Visa Card — Pay online now</option>
              </select>
            )}
          </div>

          {error && <div className="bk-error">{error}</div>}

          <button className="bk-btn bk-btn-primary bk-btn-full" onClick={handleBook} disabled={booking}>
            {booking ? "Booking..." : (isConsultation || paymentMethod === "visa") ? "Proceed to Payment →" : "Book Now!"}
          </button>
          <p className="bk-chat-note">📧 A confirmation email and invoice will be sent to you after booking.</p>
        </div>
      </section>

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
              {pkg.discount && <div className="bk-pkg-discount-badge">{pkg.discount}</div>}
              <h3>{pkg.name}</h3>
              <ul>{pkg.features.map(f => <li key={f}><span className="bk-check">✓</span>{f}</li>)}</ul>
              <div className="bk-pkg-price">
                <span className="bk-pkg-price-current">{pkg.price}</span>
                {pkg.originalPrice && <span className="bk-pkg-price-original">{pkg.originalPrice}</span>}
              </div>
              <button className={`bk-btn ${i === 1 ? "bk-btn-primary" : "bk-btn-outline-dark"}`} onClick={() => { setSelectedPackage(pkg); scrollToBooking(); }}>
                Select {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bk-contact">
        <div className="bk-contact-tag">
          <span className="bk-tag bk-tag-dark">We're Here When You Need Us</span>
          <h2>Get in Touch</h2>
        </div>
        <div className="bk-contact-grid">
          <div className="bk-contact-img">
            <img src="https://www.shutterstock.com/image-photo/medical-worker-using-laptop-touching-600nw-2496055089.jpg" alt="Contact" />
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
                <div><span>Sunday – Thursday</span><strong>10:00 AM – 10:00 PM</strong></div>
                <div><span>Friday</span><strong>Closed</strong></div>
                <div><span>Saturday</span><strong>12:00 PM – 10:00 PM</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

