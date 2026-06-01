// pages/DoctorProfile.jsx
import { useParams, Link } from "react-router-dom";
import "../style/DoctorProfile.css";   // create this or inline styles below

// ── Shared data – keep in sync with JoinUs.jsx (or move to a shared file) ──
const SPECIALISTS = [
  {
    id: "abdallah-hamdy",
    name: "Dr. Abdallah Hamdy",
    title: "General Physiotherapist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
    rating: "4.9",
    stars: "★★★★★",
    reviews: 312,
    experience: "12 Years",
    patients: "1,200+",
    education: "Cairo University — BSc Physiotherapy",
    languages: ["Arabic", "English"],
    about:
      "Dr. Abdallah Hamdy is a highly experienced general physiotherapist specialising in musculoskeletal and neurological rehabilitation. He takes a patient-centred approach, combining manual therapy with personalised exercise programmes to help patients recover faster and stay active.",
    services: [
      "Manual Therapy",
      "Dry Needling",
      "Postural Assessment",
      "Home Exercise Plans",
      "Pain Management",
    ],
    availability: ["Sun", "Mon", "Tue", "Thu"],
    price: "350 EGP / session",
  },
  {
    id: "fatima-noor",
    name: "Dr. Fatima Noor",
    title: "Sports Rehab Specialist",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80",
    rating: "4.8",
    stars: "★★★★★",
    reviews: 278,
    experience: "9 Years",
    patients: "950+",
    education: "Ain Shams University — MSc Sports Medicine",
    languages: ["Arabic", "English", "French"],
    about:
      "Dr. Fatima Noor works with athletes of all levels to prevent and recover from sports injuries. Her evidence-based rehabilitation protocols have helped hundreds of players return to their sport stronger than before.",
    services: [
      "Sports Injury Rehab",
      "Taping & Strapping",
      "Strength & Conditioning",
      "Return-to-Sport Testing",
      "Concussion Management",
    ],
    availability: ["Mon", "Wed", "Thu", "Sat"],
    price: "400 EGP / session",
  },
  {
    id: "ahmed-hassan",
    name: "Dr. Ahmed Hassan",
    title: "Elderly Care Specialist",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80",
    rating: "4.9",
    stars: "★★★★★",
    reviews: 196,
    experience: "15 Years",
    patients: "800+",
    education: "Alexandria University — PhD Geriatric Rehabilitation",
    languages: ["Arabic", "English"],
    about:
      "Dr. Ahmed Hassan is AfiyaCare's lead physiotherapist with a passion for improving the quality of life of elderly patients. He specialises in fall prevention, balance training, and post-stroke rehabilitation.",
    services: [
      "Balance & Fall Prevention",
      "Post-Stroke Rehab",
      "Gait Training",
      "Cognitive-Motor Exercises",
      "Home Visit Assessments",
    ],
    availability: ["Sun", "Tue", "Wed", "Sat"],
    price: "380 EGP / session",
  },
  {
    id: "layla-ibrahim",
    name: "Dr. Layla Ibrahim",
    title: "Post Surgery Specialist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
    rating: "5.0",
    stars: "★★★★★",
    reviews: 401,
    experience: "11 Years",
    patients: "1,500+",
    education: "Mansoura University — MSc Orthopaedic Physiotherapy",
    languages: ["Arabic", "English"],
    about:
      "Dr. Layla Ibrahim is AfiyaCare's most-reviewed specialist, renowned for her meticulous post-operative rehabilitation programmes following joint replacements, spinal surgery, and ligament reconstructions.",
    services: [
      "Post-Op Rehab",
      "Joint Replacement Recovery",
      "Scar Tissue Management",
      "Hydrotherapy",
      "Lymphatic Drainage",
    ],
    availability: ["Mon", "Tue", "Thu", "Fri"],
    price: "450 EGP / session",
  },
  {
    id: "yusuf-musa",
    name: "Dr. Yusuf Musa",
    title: "Orthopedic Surgeon",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80",
    rating: "4.7",
    stars: "★★★★☆",
    reviews: 223,
    experience: "18 Years",
    patients: "2,000+",
    education: "Cairo University — MD Orthopaedic Surgery",
    languages: ["Arabic", "English", "German"],
    about:
      "Dr. Yusuf Musa is a consultant orthopaedic surgeon with expertise in minimally invasive procedures and complex joint reconstructions. He collaborates closely with the physiotherapy team to ensure seamless surgical and post-surgical care.",
    services: [
      "Joint Replacement",
      "Arthroscopic Surgery",
      "Fracture Management",
      "Spinal Decompression",
      "Sports Surgery",
    ],
    availability: ["Sun", "Mon", "Wed"],
    price: "600 EGP / consultation",
  },
  {
    id: "malak-awad",
    name: "Dr. Malak Awad",
    title: "General Physiotherapist",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&q=80",
    rating: "4.9",
    stars: "★★★★★",
    reviews: 187,
    experience: "7 Years",
    patients: "600+",
    education: "Helwan University — BSc Physiotherapy (Distinction)",
    languages: ["Arabic", "English"],
    about:
      "Dr. Malak Awad brings warmth and precision to every session. She works extensively with patients suffering from chronic back pain, neck conditions, and workplace injuries, with a strong focus on long-term prevention.",
    services: [
      "Back & Neck Rehab",
      "Ergonomic Assessment",
      "Pilates-Based Therapy",
      "Electrotherapy",
      "Workplace Injury Rehab",
    ],
    availability: ["Tue", "Wed", "Thu", "Sat"],
    price: "330 EGP / session",
  },
];

// ── Day ordering for the availability display ──
const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorProfile() {
  const { id } = useParams();
  const doctor = SPECIALISTS.find((s) => s.id === id);

  // 404-style fallback
  if (!doctor) {
    return (
      <div className="dp-not-found">
        <h2>Doctor not found</h2>
        <p>The profile you're looking for doesn't exist.</p>
        <Link to="/join-us" className="dp-back-btn">← Back to Our Team</Link>
      </div>
    );
  }

  return (
    <div className="dp-page">
      {/* ── Hero Card ── */}
      <section className="dp-hero">
        <div className="dp-hero-inner">
          <Link to="/join-us" className="dp-back-link">← Back to Our Team</Link>

          <div className="dp-hero-card">
            <div className="dp-avatar-wrap">
              <img src={doctor.image} alt={doctor.name} className="dp-avatar" />
              <span className="dp-badge-online">● Available</span>
            </div>

            <div className="dp-hero-info">
              <span className="dp-specialty-tag">{doctor.title}</span>
              <h1 className="dp-name">{doctor.name}</h1>

              <div className="dp-meta-row">
                <span className="dp-rating">
                  {doctor.stars}
                  <strong>{doctor.rating}</strong>
                  <span className="dp-review-count">({doctor.reviews} reviews)</span>
                </span>
              </div>

              <div className="dp-stats-row">
                <div className="dp-stat">
                  <strong>{doctor.experience}</strong>
                  <span>Experience</span>
                </div>
                <div className="dp-stat">
                  <strong>{doctor.patients}</strong>
                  <span>Patients</span>
                </div>
                <div className="dp-stat">
                  <strong>{doctor.rating}</strong>
                  <span>Rating</span>
                </div>
              </div>

              <div className="dp-lang-row">
                {doctor.languages.map((l) => (
                  <span key={l} className="dp-lang-pill">{l}</span>
                ))}
              </div>

              <div className="dp-price-row">
                <span className="dp-price">{doctor.price}</span>
                <Link to="/booking" className="dp-book-btn">
                  Book Appointment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="dp-body">
        <div className="dp-body-inner">

          {/* Left column */}
          <div className="dp-col-main">
            <div className="dp-card">
              <h2 className="dp-card-title">About</h2>
              <p className="dp-about-text">{doctor.about}</p>
            </div>

            <div className="dp-card">
              <h2 className="dp-card-title">Services</h2>
              <ul className="dp-services-list">
                {doctor.services.map((s) => (
                  <li key={s} className="dp-service-item">
                    <span className="dp-service-dot">✦</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="dp-col-side">
            <div className="dp-card">
              <h2 className="dp-card-title">Education</h2>
              <p className="dp-edu-text">🎓 {doctor.education}</p>
            </div>

            <div className="dp-card">
              <h2 className="dp-card-title">Availability</h2>
              <div className="dp-availability">
                {DAY_ORDER.map((day) => (
                  <span
                    key={day}
                    className={`dp-day${doctor.availability.includes(day) ? " dp-day--on" : ""}`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="dp-card dp-cta-card">
              <h3>Ready to get started?</h3>
              <p>Book your first session with {doctor.name.split(" ")[1]} today.</p>
              <Link to="/booking" className="dp-book-btn dp-book-btn--full">
                Book Now →
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}