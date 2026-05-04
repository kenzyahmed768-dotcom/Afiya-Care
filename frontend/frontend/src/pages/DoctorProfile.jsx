import React from "react";
import { Link, useParams } from "react-router-dom";
import "../style/DoctorProfile.css";

const DOCTORS = {
  "amara-osei": {
    name: "Dr. Amara Osei",
    title: "Cardiologist",
    tag: "Cardiac Rehabilitation Specialist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=80",
    rating: "4.9",
    reviewsCount: "312",
    location: "Cairo, Egypt",
    fee: "EGP 500",
    about:
      "Experienced specialist focused on cardiac rehabilitation, post-cardiovascular recovery, and patient follow-up programs.",
    qualifications: [
      "Bachelor of Medicine",
      "Cardiac Rehabilitation Certification",
      "Advanced Patient Recovery Training",
      "Clinical Rehabilitation Specialist",
    ],
    education:
      "Faculty of Medicine, Cairo University. Advanced training in cardiovascular recovery and rehabilitation.",
    experience:
      "Over 10 years of experience helping patients recover safely after cardiovascular conditions and surgeries.",
    specialties: [
      "Cardiac Rehab",
      "Post Cardiovascular Recovery",
      "Patient Follow-up",
      "Exercise Therapy",
      "Lifestyle Recovery Plans",
    ],
  },

  "fatima-noor": {
    name: "Dr. Fatima Noor",
    title: "Dermatologist",
    tag: "Skin & Recovery Specialist",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=500&q=80",
    rating: "4.8",
    reviewsCount: "278",
    location: "Cairo, Egypt",
    fee: "EGP 450",
    about:
      "Specialist in dermatology-related recovery support, skin care consultation, and patient treatment planning.",
    qualifications: [
      "Bachelor of Medicine",
      "Dermatology Specialist Training",
      "Clinical Patient Care Certification",
      "Skin Health Consultation Training",
    ],
    education:
      "Faculty of Medicine, Ain Shams University. Specialized training in dermatology and patient care.",
    experience:
      "8 years of experience supporting patients with skin conditions, recovery plans, and medical consultations.",
    specialties: [
      "Dermatology",
      "Skin Care",
      "Patient Consultation",
      "Recovery Support",
      "Treatment Planning",
    ],
  },

  "kwame-ansah": {
    name: "Dr. Kwame Ansah",
    title: "Neurologist",
    tag: "Neurological Rehabilitation Specialist",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&q=80",
    rating: "4.9",
    reviewsCount: "196",
    location: "Cairo, Egypt",
    fee: "EGP 600",
    about:
      "Focused on neurological rehabilitation, mobility recovery, and long-term treatment plans for neurological conditions.",
    qualifications: [
      "Bachelor of Medicine",
      "Neurological Rehabilitation Certification",
      "Mobility Recovery Training",
      "Advanced Neuro Therapy Training",
    ],
    education:
      "Faculty of Medicine, Cairo University. Advanced specialization in neurology and rehabilitation.",
    experience:
      "More than 11 years of experience treating patients with neurological movement and recovery challenges.",
    specialties: [
      "Neurological Rehab",
      "Stroke Recovery",
      "Mobility Training",
      "Balance Therapy",
      "Nerve Recovery Support",
    ],
  },

  "lena-boateng": {
    name: "Dr. Lena Boateng",
    title: "Pediatrician",
    tag: "Pediatric Physiotherapy Specialist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80",
    rating: "5.0",
    reviewsCount: "401",
    location: "Cairo, Egypt",
    fee: "EGP 550",
    about:
      "Specialist in pediatric care, child development support, and rehabilitation programs for children.",
    qualifications: [
      "Bachelor of Medicine",
      "Pediatric Care Certification",
      "Child Development Training",
      "Pediatric Rehabilitation Specialist",
    ],
    education:
      "Faculty of Medicine, Alexandria University. Specialized training in pediatric rehabilitation and child care.",
    experience:
      "Over 9 years of experience working with children and families through personalized care plans.",
    specialties: [
      "Pediatric Physiotherapy",
      "Child Development",
      "Movement Therapy",
      "Family Guidance",
      "Rehabilitation for Children",
    ],
  },

  "yusuf-musa": {
    name: "Dr. Yusuf Musa",
    title: "Orthopedic Surgeon",
    tag: "Orthopedic Rehabilitation Specialist",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80",
    rating: "4.7",
    reviewsCount: "223",
    location: "Cairo, Egypt",
    fee: "EGP 650",
    about:
      "Experienced in orthopedic cases, post-surgical recovery, joint pain, and musculoskeletal rehabilitation.",
    qualifications: [
      "Bachelor of Medicine",
      "Orthopedic Surgery Certification",
      "Post-Surgical Rehab Training",
      "Musculoskeletal Care Specialist",
    ],
    education:
      "Faculty of Medicine, Cairo University. Specialized training in orthopedic surgery and rehabilitation.",
    experience:
      "12 years of experience in orthopedic treatment, injury recovery, and post-operation rehabilitation.",
    specialties: [
      "Orthopedic Rehab",
      "Post-Surgery Rehab",
      "Joint Pain",
      "Muscle Injuries",
      "Mobility Recovery",
    ],
  },

  "aisha-diallo": {
    name: "Dr. Aisha Diallo",
    title: "Oncologist",
    tag: "Oncology Recovery Specialist",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&q=80",
    rating: "4.9",
    reviewsCount: "187",
    location: "Cairo, Egypt",
    fee: "EGP 700",
    about:
      "Specialist in oncology patient support, recovery planning, and long-term rehabilitation after treatment.",
    qualifications: [
      "Bachelor of Medicine",
      "Oncology Specialist Training",
      "Cancer Recovery Support Certification",
      "Patient Care Planning Certification",
    ],
    education:
      "Faculty of Medicine, Cairo University. Advanced training in oncology care and patient recovery support.",
    experience:
      "10 years of experience supporting oncology patients through treatment recovery and rehabilitation planning.",
    specialties: [
      "Oncology Support",
      "Recovery Planning",
      "Fatigue Management",
      "Patient Follow-up",
      "Long-Term Care",
    ],
  },
};

function DoctorProfile() {
  const { id } = useParams();
  const doctor = DOCTORS[id];

  const availableTimes = ["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"];

  const reviews = [
    {
      name: "Sara M.",
      rating: "★★★★★",
      text: "Very professional and explained my treatment plan clearly. I felt improvement after a few sessions.",
    },
    {
      name: "Ahmed K.",
      rating: "★★★★★",
      text: "Great doctor, punctual appointments, and excellent follow-up after every session.",
    },
  ];

  if (!doctor) {
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <h2>Doctor not found</h2>
        <p>Please go back and select a doctor from the specialists section.</p>
        <Link to="/join" className="doctor-book-btn">
          Back to Specialists
        </Link>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page">
      <section className="doctor-hero">
        <div className="doctor-card">
          <img src={doctor.image} alt={doctor.name} className="doctor-photo" />

          <div className="doctor-main-info">
            <span className="doctor-tag">{doctor.tag}</span>
            <h1>{doctor.name}</h1>
            <p className="doctor-title">{doctor.title}</p>

            <div className="doctor-meta">
              <span>⭐ {doctor.rating} Rating</span>
              <span>📍 {doctor.location}</span>
              <span>💬 {doctor.reviewsCount} Reviews</span>
            </div>

            <p className="doctor-about">{doctor.about}</p>

            <Link to="/booking" className="doctor-book-btn">
              Book Appointment
            </Link>
          </div>
        </div>
      </section>

      <section className="doctor-content">
        <div className="doctor-left">
          <div className="profile-section">
            <h2>Qualifications</h2>
            <ul>
              {doctor.qualifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="profile-section">
            <h2>Education</h2>
            <p>{doctor.education}</p>
          </div>

          <div className="profile-section">
            <h2>Experience</h2>
            <p>{doctor.experience}</p>
          </div>

          <div className="profile-section">
            <h2>Specialties & Subspecialties</h2>
            <div className="specialty-tags">
              {doctor.specialties.map((specialty) => (
                <span key={specialty}>{specialty}</span>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h2>Reviews</h2>
            {reviews.map((review, index) => (
              <div className="review-card" key={index}>
                <div className="review-top">
                  <strong>{review.name}</strong>
                  <span>{review.rating}</span>
                </div>
                <p>{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="doctor-right">
          <div className="booking-box">
            <h3>Consultation Fees</h3>
            <p className="fee">{doctor.fee}</p>
            <span className="fee-note">Clinic or home visit options available</span>
          </div>

          <div className="booking-box">
            <h3>Available Appointments</h3>
            <div className="time-grid">
              {availableTimes.map((time) => (
                <button key={time}>{time}</button>
              ))}
            </div>
          </div>

          <div className="booking-box">
            <h3>Location</h3>
            <p>📍 {doctor.location}</p>
            <p>🏠 Home visits available in selected areas</p>
          </div>

          <Link to="/booking" className="side-book-btn">
            Continue Booking
          </Link>
        </aside>
      </section>
    </div>
  );
}

export default DoctorProfile;