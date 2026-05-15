import { useState } from "react";
import "../style/PatientCommunity.css";

const discussions = [
  {
    id: 1,
    initials: "JW",
    avatarClass: "pc-av-blue",
    author: "Joy W.",
    time: "2 hours ago",
    tag: "Chronic care",
    tagClass: "pc-tag-blue",
    title: "Tips for managing fatigue during treatment — what has actually worked for you?",
    preview:
      "I've tried everything my doctor suggested but still struggling with the afternoon crash. Would love to hear real strategies from people going through similar situations.",
    replies: 24,
    helpful: 47,
    trending: true,
  },
  {
    id: 2,
    initials: "NB",
    avatarClass: "pc-av-mid",
    author: "Nadia B.",
    time: "5 hours ago",
    tag: "Advocacy",
    tagClass: "pc-tag-teal",
    title: "My experience asking for a second opinion — and why you should too",
    preview:
      "It took me two years and four doctors before I got the right diagnosis. Here's the exact language I used and what finally made the difference in getting taken seriously.",
    replies: 18,
    helpful: 89,
    trending: false,
  },
  {
    id: 3,
    initials: "KM",
    avatarClass: "pc-av-deep",
    author: "Kwame M.",
    time: "Yesterday",
    tag: "Mental wellness",
    tagClass: "pc-tag-mid",
    title: "Anxiety before appointments — how do you calm your nervous system?",
    preview:
      "Every time I have a follow-up, the night before is brutal. Racing thoughts, can't sleep. Looking for grounding techniques that don't feel generic or dismissive.",
    replies: 31,
    helpful: 62,
    trending: false,
  },
  {
    id: 4,
    initials: "FA",
    avatarClass: "pc-av-teal",
    author: "Fatou A.",
    time: "2 days ago",
    tag: "Nutrition",
    tagClass: "pc-tag-blue",
    title: "Anti-inflammatory meal prep for busy weeks — my go-to rotation",
    preview:
      "Sharing my 5-meal rotation that keeps inflammation manageable without spending hours in the kitchen. Lots of West African staples that work beautifully for this.",
    replies: 42,
    helpful: 115,
    trending: false,
  },
];

const categories = ["All topics", "Chronic care", "Mental wellness", "Nutrition", "Advocacy", "Caregivers"];

const careTeam = [
  { initials: "DR", avatarClass: "pc-av-mid",  name: "Dr. Reeves",  role: "Primary physician",  online: true },
  { initials: "NT", avatarClass: "pc-av-teal", name: "Nurse Tosin", role: "Care coordinator",    online: true },
  { initials: "PC", avatarClass: "pc-av-deep", name: "Dr. Chen",    role: "Specialist",          online: false },
];

const events = [
  { month: "May", day: "19", name: "Chronic pain support circle",   time: "6:00 PM · 60 min",  type: "Virtual · 23 attending" },
  { month: "May", day: "22", name: "Nutrition Q&A with a dietitian", time: "12:00 PM · 45 min", type: "Virtual · 41 attending" },
  { month: "May", day: "28", name: "Caregiver burnout workshop",    time: "5:30 PM · 90 min",  type: "Virtual · 12 attending" },
];

const resources = [
  { icon: "🩺", bg: "#e8f3fb", title: "Prepare for your visit",   desc: "Question templates & checklists" },
  { icon: "📋", bg: "#e0f7f6", title: "Know your rights",         desc: "Patient advocacy guide" },
  { icon: "🧠", bg: "#dbeafe", title: "Mental wellness toolkit",  desc: "Grounding & coping strategies" },
  { icon: "🍽️", bg: "#e8f3fb", title: "Nutrition library",       desc: "Anti-inflammatory recipes & guides" },
];

const moods = [
  { emoji: "😔", message: "Glad you're here 💙" },
  { emoji: "😐", message: "Sending you strength 🌊" },
  { emoji: "🙂", message: "That's wonderful! 🌟" },
  { emoji: "😄", message: "Amazing! Keep shining ☀️" },
];

export default function PatientCommunity() {
  const [activeCategory, setActiveCategory] = useState("All topics");
  const [selectedMood, setSelectedMood] = useState(null);

  const filteredDiscussions =
    activeCategory === "All topics"
      ? discussions
      : discussions.filter((d) => d.tag === activeCategory);

  return (
    <>
      {/* NAV */}
      <nav className="pc-nav">
        <a href="/" className="pc-nav-logo">
          <span className="pc-logo-dot" />
          Afiya Care
        </a>
        <ul className="pc-nav-links">
          <li><a href="#">My health</a></li>
          <li><a href="#">Messages</a></li>
          <li><a href="#" style={{ color: "#fff" }}>Community</a></li>
          <li><a href="#" className="pc-nav-cta">+ New post</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="pc-hero">
        <div className="pc-hero-tag">Patient community</div>
        <h1>
          A place to <em>heal</em>
          <br />
          together
        </h1>
        <p className="pc-hero-sub">
          Share experiences, ask questions, and find support from people who understand your journey.
        </p>
        <div className="pc-hero-actions">
          <button className="pc-btn-primary">Join a group →</button>
          <button className="pc-btn-ghost">Browse discussions</button>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="pc-stats-strip">
        {[
          { num: "4,200+", label: "Community members" },
          { num: "38",     label: "Active groups" },
          { num: "120",    label: "Posts this week" },
          { num: "96%",    label: "Feel supported" },
        ].map((s) => (
          <div className="pc-stat-item" key={s.label}>
            <span className="pc-stat-num">{s.num}</span>
            <span className="pc-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* PAGE BODY */}
      <div className="pc-page-content">
        {/* MAIN COLUMN */}
        <main>
          {/* Featured */}
          <div className="pc-featured-card">
            <div className="pc-featured-label">★ Featured story</div>
            <div className="pc-featured-title">
              How I finally found a care team that listened to me
            </div>
            <p className="pc-featured-body">
              After years of feeling unheard, community member Amara shares the questions she
              learned to ask and the breakthroughs that changed everything about her care.
            </p>
            <button className="pc-btn-primary" style={{ fontSize: 13 }}>
              Read her story →
            </button>
          </div>

          {/* New post bar */}
          <div className="pc-new-post-bar">
            <div className="pc-avatar pc-av-teal" style={{ width: 36, height: 36, fontSize: 12 }}>
              YO
            </div>
            <span className="pc-new-post-placeholder">Share something with the community…</span>
            <button className="pc-btn-blue">Post</button>
          </div>

          {/* Categories */}
          <div className="pc-categories">
            {categories.map((c) => (
              <button
                key={c}
                className={`pc-pill${activeCategory === c ? " active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Section header */}
          <div className="pc-section-header">
            <span className="pc-section-title">Recent discussions</span>
            <a href="#" className="pc-see-all">See all →</a>
          </div>

          {/* Discussion cards */}
          {filteredDiscussions.length === 0 && (
            <p style={{ color: "var(--ink-muted)", fontSize: 14, padding: "1rem 0" }}>
              No discussions in this category yet — be the first to post!
            </p>
          )}

          {filteredDiscussions.map((d) => (
            <div className="pc-discussion-card" key={d.id}>
              <div className="pc-card-top">
                <div className="pc-card-meta">
                  <div className={`pc-avatar ${d.avatarClass}`}>{d.initials}</div>
                  <div>
                    <span className="pc-author-name">{d.author}</span>
                    <span className="pc-post-time">{d.time}</span>
                  </div>
                </div>
                <span className={`pc-tag ${d.tagClass}`}>{d.tag}</span>
              </div>
              <div className="pc-card-title">{d.title}</div>
              <p className="pc-card-preview">{d.preview}</p>
              <div className="pc-card-footer">
                <span className="pc-card-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {d.replies} replies
                </span>
                <span className="pc-card-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {d.helpful} helpful
                </span>
                {d.trending && <span className="pc-trending-badge">🔥 Trending</span>}
              </div>
            </div>
          ))}
        </main>

        {/* SIDEBAR */}
        <aside className="pc-sidebar">

          {/* Mood check */}
          <div className="pc-sidebar-card">
            <div className="pc-sidebar-title">How are you today?</div>
            <p className="pc-mood-label">Check in with yourself</p>
            <div className="pc-mood-buttons">
              {moods.map((m, i) => (
                <button
                  key={i}
                  className={`pc-mood-btn${selectedMood === i ? " selected" : ""}`}
                  onClick={() => setSelectedMood(i)}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
            {selectedMood !== null && (
              <div className="pc-mood-result" style={{ display: "block" }}>
                {moods[selectedMood].message}
              </div>
            )}
          </div>

          {/* Care team */}
          <div className="pc-sidebar-card">
            <div className="pc-sidebar-title">My care team</div>
            {careTeam.map((m) => (
              <div className="pc-care-member" key={m.name}>
                <div className={`pc-avatar ${m.avatarClass}`} style={{ width: 32, height: 32, fontSize: 11 }}>
                  {m.initials}
                </div>
                <div className="pc-member-info">
                  <span className="pc-member-name">{m.name}</span>
                  <span className="pc-member-role">{m.role}</span>
                </div>
                <div className={m.online ? "pc-online" : "pc-offline"} title={m.online ? "Available" : "Offline"} />
              </div>
            ))}
            <button className="pc-btn-blue" style={{ width: "100%", marginTop: "0.75rem" }}>
              Message my team
            </button>
          </div>

          {/* Events */}
          <div className="pc-sidebar-card">
            <div className="pc-section-header" style={{ marginBottom: "0.75rem" }}>
              <span className="pc-sidebar-title" style={{ marginBottom: 0 }}>Upcoming events</span>
              <a href="#" className="pc-see-all">All →</a>
            </div>
            {events.map((e) => (
              <div className="pc-event-item" key={e.name}>
                <div className="pc-event-date">
                  <span className="pc-event-month">{e.month}</span>
                  <span className="pc-event-day">{e.day}</span>
                </div>
                <div>
                  <div className="pc-event-name">{e.name}</div>
                  <span className="pc-event-time">{e.time}</span>
                  <span className="pc-event-type">{e.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="pc-sidebar-card">
            <div className="pc-sidebar-title">Resources</div>
            {resources.map((r) => (
              <div className="pc-resource-link" key={r.title}>
                <div className="pc-resource-icon" style={{ background: r.bg }}>{r.icon}</div>
                <div>
                  <span className="pc-resource-title">{r.title}</span>
                  <span className="pc-resource-desc">{r.desc}</span>
                </div>
              </div>
            ))}
          </div>

        </aside>
      </div>

      {/* FOOTER */}
      <footer className="pc-footer">
        <p>
          <span>afiya care</span> · A safe space for every patient ·{" "}
          <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </footer>
    </>
  );
}