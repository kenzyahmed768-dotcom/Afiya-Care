import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Homepage.css";
import "../style/About.css";
import Logo from "../images/logo.jpeg";

/* ── Interactive Repulse Particle Canvas ── */
function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    // Set up mouse tracking
    let mouse = { x: null, y: null, radius: 150 };

    // We track the mouse on the window so it works even if you hover over the text!
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave); // triggers if mouse leaves browser

    const resize = () => { 
      canvas.width = canvas.offsetWidth; 
      canvas.height = canvas.offsetHeight; 
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 80; // Slightly more dots for a better interactive web
    const dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      baseVx: (Math.random() - 0.5) * 0.5,
      baseVy: (Math.random() - 0.5) * 0.5,
      vx: 0,
      vy: 0,
    }));

    // Initialize velocities
    dots.forEach(d => { d.vx = d.baseVx; d.vy = d.baseVy; });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((d) => {
        // --- PHYSICS: MOUSE REPULSE ---
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - d.x;
          let dy = mouse.y - d.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            // Calculate force (closer = stronger push)
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;

            // Apply the push
            d.vx -= forceDirectionX * force * 0.6;
            d.vy -= forceDirectionY * force * 0.6;
          }
        }

        // --- PHYSICS: FRICTION & MOVEMENT ---
        // Slowly return back to their normal drifting speed
        d.vx += (d.baseVx - d.vx) * 0.05;
        d.vy += (d.baseVy - d.vy) * 0.05;

        d.x += d.vx;
        d.y += d.vy;

        // Bounce off edges instead of teleporting
        if (d.x < 0 || d.x > canvas.width) { d.baseVx *= -1; d.vx *= -1; }
        if (d.y < 0 || d.y > canvas.height) { d.baseVy *= -1; d.vy *= -1; }

        // Draw dot
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(42,127,143, 0.6)`;
        ctx.fill();
      });

      // --- DRAW CONNECTING LINES ---
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          let dx = dots[i].x - dots[j].x;
          let dy = dots[i].y - dots[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(42,127,143,${0.25 * (1 - dist / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    
    draw();

    return () => { 
      cancelAnimationFrame(raf); 
      window.removeEventListener("resize", resize); 
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="ab-hero-particles" />;
}
/* ── Animated stat counter ── */
function Counter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
        else setCount(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}


export default function About() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  // ── Parallax on hero & rehab images ──
  useEffect(() => {
    const hero = document.querySelector(".ab-hero-bg");
    const rehabImgs = document.querySelectorAll(".ab-rehab-card img");
    const onScroll = () => {
      const sy = window.scrollY;
      if (hero) hero.style.transform = `translateY(${sy * 0.38}px)`;
      rehabImgs.forEach((img, i) => {
        img.style.transform = `scale(1.08) translateY(${(sy - img.closest(".ab-rehab-card").getBoundingClientRect().top - sy) * 0.06 * (i % 2 === 0 ? 1 : -1)}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Staggered scroll reveal (cards get stagger delays) ──
  useEffect(() => {
    const reveals = document.querySelectorAll(".ab-reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ab-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Reviews slider ──
  useEffect(() => {
    const track    = document.getElementById("ab-reviewsTrack");
    const dotsWrap = document.getElementById("ab-revDots");
    if (!track || !dotsWrap) return;

    const cards  = Array.from(track.querySelectorAll(".ab-review-card"));
    const GAP    = 18;
    const VISIBLE = 2;
    const STEPS  = cards.length - VISIBLE + 1;
    let current  = 0;
    let autoTimer;

    dotsWrap.innerHTML = "";
    for (let i = 0; i < STEPS; i++) {
      const d = document.createElement("button");
      d.className = "ab-rev-dot" + (i === 0 ? " active" : "");
      d.addEventListener("click", () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(d);
    }
    const dots = Array.from(dotsWrap.querySelectorAll(".ab-rev-dot"));

    function updateActive() {
      cards.forEach((c, i) => c.classList.toggle("active", i === current || i === current + 1));
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
    }
    function setCardWidths() {
      const wrapW = track.parentElement.getBoundingClientRect().width;
      const cardW = (wrapW - GAP) / 2;
      cards.forEach((c) => (c.style.width = cardW + "px"));
      return cardW;
    }
    function goTo(idx) {
      current = ((idx % STEPS) + STEPS) % STEPS;
      const cardW = setCardWidths();
      track.style.transform = `translateX(-${current * (cardW + GAP)}px)`;
      updateActive();
    }
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 3500);
    }

    document.getElementById("ab-revNext")?.addEventListener("click", () => { goTo(current + 1); resetAuto(); });
    document.getElementById("ab-revPrev")?.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
    track.addEventListener("mouseenter", () => clearInterval(autoTimer));
    track.addEventListener("mouseleave", resetAuto);
    setCardWidths(); updateActive(); resetAuto();

    const onResize = () => goTo(current);
    window.addEventListener("resize", onResize);
    return () => { clearInterval(autoTimer); window.removeEventListener("resize", onResize); };
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
      <section className="ab-hero">
        <div className="ab-hero-bg"></div>
        <div className="ab-hero-overlay"></div>
        <HeroParticles />
        <div className="ab-hero-content">
          <p className="ab-hero-eyebrow">Afiya Care · Est. 2015</p>
          <h1>About Us</h1>
          <p className="ab-hero-sub">Expert physiotherapy. Real recovery. Lasting results.</p>
          <div className="ab-hero-stats">
            {[
              { val: 500, suffix: "+", label: "Patients Treated" },
              { val: 10,  suffix: " yrs", label: "Experience" },
              { val: 98,  suffix: "%", label: "Satisfaction Rate" },
              { val: 6,   suffix: "", label: "Specialities" },
            ].map((s) => (
              <div className="ab-hero-stat" key={s.label}>
                <strong><Counter target={s.val} suffix={s.suffix} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT INTRO ══ */}
      <section className="ab-intro">
        <div className="ab-intro-left ab-reveal">
          <p className="ab-eyebrow">/ About Us</p>
          <h2>We are the Best For Physiotherapy</h2>
          <div className="ab-desc-box">
            At Afiya Care, we provide expert physiotherapy with personalized treatments and
            modern techniques to help you recover faster, move better, and live pain free.
          </div>
          <div className="ab-badge-list">
            <div className="ab-badge-item">
              <div className="ab-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span>Team of highly skilled and experienced</span>
            </div>
            <div className="ab-badge-item">
              <div className="ab-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span>Board composed certified high trained</span>
            </div>
          </div>
        </div>

        <div className="ab-photos ab-reveal ab-reveal-delay">
          <div className="ab-col-left">
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80" alt="Physiotherapy session" />
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80" alt="Sports therapy" />
            <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&q=80" alt="Rehab exercise" />
          </div>
          <div className="ab-col-right">
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80" alt="Therapy" />
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80" alt="Rehab" />
            <img src="https://images.unsplash.com/photo-1573377378599-f14e90f4f0da?w=400&q=80" alt="Manual therapy" />
          </div>
        </div>
      </section>

      {/* ══ SERVICES STRIP ══ */}
<div className="ab-svc-strip">
        {[
          { 
            label: "Sports rehabilitation", 
            img: "https://img.icons8.com/ios/96/FFFFFF/dumbbell--v1.png" 
          },
          { 
            label: "Backpain management", 
            img: "https://img.icons8.com/ios/96/FFFFFF/spine.png" 
          },
          { 
            label: "Orthopedic rehabilitation", 
            img: "https://img.icons8.com/ios/96/FFFFFF/skeleton.png" 
          },
          { 
            label: "Occupational Physiotherapy", 
            img: "https://img.icons8.com/ios/96/FFFFFF/briefcase.png" 
          },
          { 
            label: "Home physiotherapy", 
            img: "https://img.icons8.com/ios/96/FFFFFF/home--v1.png" 
          },
          { 
            label: "Pelvic rehabilitation", 
            img: "https://img.icons8.com/ios/96/FFFFFF/torso.png" 
          },
        ].map((s) => (
          <div className="ab-svc-item" key={s.label}>
            <div className="ab-svc-icon">
              <img 
                src={s.img} 
                alt={s.label} 
                style={{ width: "28px", height: "28px", objectFit: "contain" }} 
              />
            </div>
            <span className="ab-svc-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ══ REHAB SECTION ══ */}
      <section className="ab-rehab">
        <h2 className="ab-section-title ab-reveal">Basics Of Rehabilitation Therapy</h2>
        <div className="ab-rehab-cards">
          {[
            { img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80", tag: "Sports therapy",  title: "Expert Sports Rehabilitation",  desc: "Afiya Care offers specialized sports therapy to help athletes recover faster. Our targeted approach gets you back to peak performance after injury.", delay: "" },
            { img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80", tag: "Manual therapy", title: "Hands-On Manual Therapy",         desc: "Manual therapy involves a range of hands-on techniques performed by therapists to reduce pain and improve mobility for lasting results.", delay: "ab-reveal-delay" },
          ].map((c) => (
            <div className={`ab-rehab-card ab-reveal ${c.delay}`} key={c.tag}>
              <img src={c.img} alt={c.tag} />
              <div className="ab-rehab-tag"><span className="ab-tag-dot"></span>{c.tag}</div>
              <div className="ab-rehab-overlay">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

        {/* ══════════════════════════════════════
            CORE VALUES SECTION
        ══════════════════════════════════════ */}
        <section className="ab-values-section">
          <div className="ab-values-header ab-reveal">
            <h2>Our Core Values</h2>
            <p>The principles that guide every treatment, interaction, and recovery plan at Afiya Care.</p>
          </div>

          <div className="ab-values-grid">
            {[
              {
                title: "Compassionate Care",
                desc: "We treat every patient with the utmost empathy, listening to your unique needs and making you feel safe and supported throughout your recovery.",
                icon: "https://img.icons8.com/ios/96/FFFFFF/hand-holding-heart.png",
                delay: ""
              },
              {
                title: "Evidence-Based Therapy",
                desc: "Our treatments are rooted in the latest scientific research and proven clinical methods, ensuring you receive the most effective care possible.",
                icon: "https://img.icons8.com/ios/96/FFFFFF/microscope.png",
                delay: "ab-reveal-delay"
              },
              {
                title: "Continuous Support",
                desc: "Healing doesn't stop when you leave our clinic. We provide ongoing education, home exercises, and guidance to keep you healthy long-term.",
                icon: "https://img.icons8.com/ios/96/FFFFFF/infinity.png",
                delay: "ab-reveal-delay-2" 
              }
            ].map((value, idx) => (
              <div className={`ab-value-card ab-reveal ${value.delay}`} key={idx}>
                <div className="ab-value-icon-wrapper">
                  {/* This is the visual rotating ring */}
                  <div className="ab-value-icon-ring"></div>
                  <img src={value.icon} alt={value.title} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
                {/* This line expands on hover */}
                <div className="ab-value-line"></div>
              </div>
            ))}
          </div>
        </section>

      {/* ══ TEAM SECTION ══ */}
      <section className="ab-team">
        <h2 className="ab-section-title ab-reveal">Our Experienced Therapist Team</h2>
        <div className="ab-team-grid">
          {[
            { name: "DR. Mahmoud El Esely",  role: "Senior Physiotherapy",  img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80", d: "" },
            { name: "DR. Mohamed El Gebely", role: "Pediatric Therapist",   img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80", d: "ab-reveal-delay" },
            { name: "DR. Hoda EL Azeby",     role: "Neurologics Therapist", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80", d: "ab-reveal-delay2" },
          ].map((doc) => (
            <div className={`ab-team-card ab-reveal ${doc.d}`} key={doc.name}>
              <img src={doc.img} alt={doc.name} />
              <h4>{doc.name}</h4>
              <span>{doc.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ REVIEWS ══ */}
      <section className="ab-reviews">
        <div className="ab-reviews-inner">
          <div className="ab-reviews-left ab-reveal">
            <h2>Our Clients Reviews</h2>
            <p>At Afiya Care, we pride ourselves on providing exceptional physiotherapy services that deliver real results. But don't just take our word for it.</p>
            <div className="ab-rev-nav">
              <button className="ab-rev-btn" id="ab-revPrev">&#8592;</button>
              <button className="ab-rev-btn" id="ab-revNext">&#8594;</button>
            </div>
            <div className="ab-rev-dots" id="ab-revDots"></div>
          </div>
          <div className="ab-slider-wrap ab-reveal ab-reveal-delay">
            <div className="ab-reviews-track" id="ab-reviewsTrack">
              {[
                { name: "Ella W.",   role: "Professional Athlete", img: "https://randomuser.me/api/portraits/women/44.jpg", text: "After my knee surgery, the team at Afiya Care helped me regain my mobility in ways I never imagined. The personalized treatment plan was incredible." },
                { name: "Tom H.",    role: "Marathon Runner",      img: "https://randomuser.me/api/portraits/men/36.jpg",   text: "The therapists here are amazing! I was dealing with chronic back pain, and after just a few sessions the difference was truly unbelievable." },
                { name: "Sara M.",   role: "Retired Teacher",      img: "https://randomuser.me/api/portraits/women/62.jpg", text: "I came in barely able to walk after my hip replacement. Within 8 weeks of therapy I was back on my feet. Afiya Care changed my life." },
                { name: "Khaled R.", role: "Tennis Coach",         img: "https://randomuser.me/api/portraits/men/52.jpg",   text: "Outstanding care from start to finish. The team diagnosed my shoulder issue quickly and had me playing tennis again in 6 weeks." },
                { name: "Nadia F.",  role: "Parent",               img: "https://randomuser.me/api/portraits/women/29.jpg", text: "My daughter had speech difficulties and the speech therapy team was so patient and professional. We saw real progress within a month." },
                { name: "Hassan A.", role: "Retired Engineer",     img: "https://randomuser.me/api/portraits/men/71.jpg",   text: "The home visit service is a game changer. Having expert physiotherapy come to you when mobility is limited is exactly what elderly care should look like." },
              ].map((r, i) => (
                <div className={`ab-review-card ${i < 2 ? "active" : ""}`} key={r.name}>
                  <div className="ab-stars">★★★★★</div>
                  <p>{r.text}</p>
                  <div className="ab-reviewer">
                    <img src={r.img} alt={r.name} />
                    <div>
                      <h5>{r.name}</h5>
                      <span>{r.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="ab-footer">
        <div className="ab-footer-grid">
          <div className="ab-footer-brand">
            <a href="/" className="ab-footer-logo">
              <img src={Logo} alt="AfiyaCare" className="ab-logo-img" />
              <span className="ab-footer-brand-name">AFIYA<em>CARE</em></span>
            </a>
            <p>At Afiya Care, we provide expert physiotherapy services designed to restore movement, reduce pain, and support overall wellness.</p>
          </div>
          <div className="ab-footer-col">
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
          <div className="ab-footer-col">
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
          <div className="ab-footer-col">
            <h5>Contact us</h5>
            <ul>
              <li><a href="#">afiyacare@gmail.com</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">WhatsApp</a></li>
              <li><a href="/help">Help center</a></li>
            </ul>
            <div className="ab-newsletter">
              <input type="email" placeholder="Your email" />
              <button>&#8594;</button>
            </div>
          </div>
        </div>
        <div className="ab-footer-bottom">
          <div className="ab-social">
            <a href="#">f</a><a href="#">t</a><a href="#">in</a>
          </div>
          <p>©️ 2025 Afiya Care. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
