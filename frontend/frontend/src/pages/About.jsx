import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Homepage.css";
import "../style/About.css";

function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let mouse = { x: null, y: null, radius: 150 };

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
    window.addEventListener("mouseout", handleMouseLeave);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const COUNT = 80;
    const dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      baseVx: (Math.random() - 0.5) * 0.5,
      baseVy: (Math.random() - 0.5) * 0.5,
      vx: 0,
      vy: 0,
    }));

    dots.forEach((d) => {
      d.vx = d.baseVx;
      d.vy = d.baseVy;
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((d) => {
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - d.x;
          const dy = mouse.y - d.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius && distance > 0) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;

            d.vx -= forceDirectionX * force * 0.6;
            d.vy -= forceDirectionY * force * 0.6;
          }
        }

        d.vx += (d.baseVx - d.vx) * 0.05;
        d.vy += (d.baseVy - d.vy) * 0.05;

        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > canvas.width) {
          d.baseVx *= -1;
          d.vx *= -1;
        }

        if (d.y < 0 || d.y > canvas.height) {
          d.baseVy *= -1;
          d.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(42,127,143, 0.6)";
        ctx.fill();
      });

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

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

function Counter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
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
      },
      { threshold: 0.4 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function About() {
  const [activeRehab, setActiveRehab] = useState(0);
  const navigate = useNavigate();

  const rehabSlides = [
    {
      name: "Dr. Mahmoud El Esely",
      role: "Senior Physiotherapist",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
      services: [
        ["Orthopedic Rehab", "Recovery programs for joint, bone, and muscle injuries."],
        ["Sports Therapy", "Treatment plans for athletes and sports-related injuries."],
        ["Manual Therapy", "Hands-on techniques to reduce pain and improve movement."],
        ["Post-Surgery Rehab", "Guided recovery after surgery to restore strength."],
      ],
    },
    {
      name: "Dr. Hoda El Azeby",
      role: "Neurological Therapist",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80",
      services: [
        ["Neuro Rehab", "Support for stroke, nerve injuries, and movement recovery."],
        ["Balance Training", "Exercises to improve coordination and stability."],
        ["Mobility Support", "Programs designed to improve walking and daily function."],
        ["Pain Management", "Therapy plans to reduce chronic pain safely."],
      ],
    },
    {
      name: "Dr. Mohamed El Gebely",
      role: "Pediatric Therapist",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80",
      services: [
        ["Pediatric Therapy", "Care plans for children’s movement and development."],
        ["Posture Correction", "Helping children improve posture and body alignment."],
        ["Growth Support", "Therapy for mobility challenges during development."],
        ["Family Guidance", "Home exercises and support for parents."],
      ],
    },
  ];

  const currentRehab = rehabSlides[activeRehab];

  useEffect(() => {
    const hero = document.querySelector(".ab-hero-bg");
    const rehabImgs = document.querySelectorAll(".ab-rehab-card img");

    const onScroll = () => {
      const sy = window.scrollY;
      if (hero) hero.style.transform = `translateY(${sy * 0.38}px)`;

      rehabImgs.forEach((img, i) => {
        const card = img.closest(".ab-rehab-card");
        if (!card) return;
        img.style.transform = `scale(1.08) translateY(${
          (sy - card.getBoundingClientRect().top - sy) * 0.06 * (i % 2 === 0 ? 1 : -1)
        }px)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  useEffect(() => {
    const track = document.getElementById("ab-reviewsTrack");
    const dotsWrap = document.getElementById("ab-revDots");

    if (!track || !dotsWrap) return;

    const cards = Array.from(track.querySelectorAll(".ab-review-card"));
    const GAP = 18;
    const VISIBLE = 2;
    const STEPS = cards.length - VISIBLE + 1;
    let current = 0;
    let autoTimer;

    dotsWrap.innerHTML = "";

    for (let i = 0; i < STEPS; i++) {
      const d = document.createElement("button");
      d.className = "ab-rev-dot" + (i === 0 ? " active" : "");
      d.addEventListener("click", () => {
        goTo(i);
        resetAuto();
      });
      dotsWrap.appendChild(d);
    }

    const dots = Array.from(dotsWrap.querySelectorAll(".ab-rev-dot"));

    function updateActive() {
      cards.forEach((c, i) =>
        c.classList.toggle("active", i === current || i === current + 1)
      );
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

    const nextBtn = document.getElementById("ab-revNext");
    const prevBtn = document.getElementById("ab-revPrev");

    const nextHandler = () => {
      goTo(current + 1);
      resetAuto();
    };

    const prevHandler = () => {
      goTo(current - 1);
      resetAuto();
    };

    nextBtn?.addEventListener("click", nextHandler);
    prevBtn?.addEventListener("click", prevHandler);
    track.addEventListener("mouseenter", () => clearInterval(autoTimer));
    track.addEventListener("mouseleave", resetAuto);

    setCardWidths();
    updateActive();
    resetAuto();

    const onResize = () => goTo(current);
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(autoTimer);
      window.removeEventListener("resize", onResize);
      nextBtn?.removeEventListener("click", nextHandler);
      prevBtn?.removeEventListener("click", prevHandler);
    };
  }, []);

  return (
    <>
      <section className="ab-hero">
        <div className="ab-hero-bg"></div>
        <div className="ab-hero-overlay"></div>
        <HeroParticles />

        <div className="ab-hero-content">
          <p className="ab-hero-eyebrow">Afiya Care · Est. 2015</p>
          <h1>About Us</h1>
          <p className="ab-hero-sub">
            Expert physiotherapy. Real recovery. Lasting results.
          </p>

          <div className="ab-hero-stats">
            {[
              { val: 500, suffix: "+", label: "Patients Treated" },
              { val: 10, suffix: " yrs", label: "Experience" },
              { val: 98, suffix: "%", label: "Satisfaction Rate" },
              { val: 6, suffix: "", label: "Specialities" },
            ].map((s) => (
              <div className="ab-hero-stat" key={s.label}>
                <strong>
                  <Counter target={s.val} suffix={s.suffix} />
                </strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-intro">
        <div className="ab-intro-left ab-reveal">
          <p className="ab-eyebrow">/ About Us</p>
          <h2>We are the Best For Physiotherapy</h2>

          <div className="ab-desc-box">
            At Afiya Care, we provide expert physiotherapy with personalized
            treatments and modern techniques to help you recover faster, move
            better, and live pain free.
          </div>

          <div className="ab-badge-list">
            <div className="ab-badge-item">
              <div className="ab-badge-icon">👥</div>
              <span>Team of highly skilled and experienced</span>
            </div>

            <div className="ab-badge-item">
              <div className="ab-badge-icon">✓</div>
              <span>Board composed certified high trained</span>
            </div>

            <div className="ab-badge-item">
              <div className="ab-badge-icon">✎</div>
              <span>Personalized treatment plans for every patient</span>
            </div>

            <div className="ab-badge-item">
              <div className="ab-badge-icon">◷</div>
              <span>Flexible appointments & continuous patient support</span>
            </div>
          </div>
        </div>

        <div className="ab-photos ab-reveal ab-reveal-delay">
          <div className="ab-col-left">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80"
              alt="Physiotherapy treatment"
            />
            <img
              src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&q=80"
              alt="Therapist with patient"
            />
            <img
              src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&q=80"
              alt="Manual therapy session"
            />
          </div>

          <div className="ab-col-right">
            <img
              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80"
              alt="Medical consultation"
            />
            <img
              src="https://images.unsplash.com/photo-1576765608622-067973a79f53?w=400&q=80"
              alt="Pediatric physiotherapy"
            />
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80"
              alt="Healthcare teamwork"
            />
          </div>
        </div>
      </section>

      <div className="ab-svc-strip">
        {[
          {
            label: "Sports rehabilitation",
            img: "https://img.icons8.com/ios/96/FFFFFF/dumbbell--v1.png",
          },
          {
            label: "Backpain management",
            img: "https://img.icons8.com/ios/96/FFFFFF/spine.png",
          },
          {
            label: "Orthopedic rehabilitation",
            img: "https://img.icons8.com/ios/96/FFFFFF/skeleton.png",
          },
          {
            label: "Occupational Physiotherapy",
            img: "https://img.icons8.com/ios/96/FFFFFF/briefcase.png",
          },
          {
            label: "Home physiotherapy",
            img: "https://img.icons8.com/ios/96/FFFFFF/home--v1.png",
          },
          {
            label: "Pelvic rehabilitation",
            img: "https://img.icons8.com/ios/96/FFFFFF/torso.png",
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

      <section className="ab-rehab-modern">
        <div className="ab-rehab-modern-header">
          <p className="ab-eyebrow">Our Doctors</p>
          <h2>Different types of Department we have for your healthcare</h2>
        </div>

        <div className="ab-rehab-modern-grid">
          <div className="ab-rehab-doctor">
            <img src={currentRehab.image} alt={currentRehab.name} />

            <div className="ab-doctor-floating-card">
              <strong>{currentRehab.name}</strong>
              <span>{currentRehab.role}</span>
            </div>
          </div>

          <div className="ab-rehab-services-grid">
            {currentRehab.services.map(([title, desc]) => (
              <div className="ab-rehab-service-box" key={title}>
                <div className="ab-rehab-service-icon">✦</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ab-rehab-slider-controls">
          {rehabSlides.map((doc, index) => (
            <button
              key={doc.name}
              className={activeRehab === index ? "active" : ""}
              onClick={() => setActiveRehab(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="ab-values-section">
        <div className="ab-values-header ab-reveal">
          <h2>Our Core Values</h2>
          <p>
            The principles that guide every treatment, interaction, and recovery
            plan at Afiya Care.
          </p>
        </div>

        <div className="ab-values-grid">
          {[
            {
              title: "Compassionate Care",
              desc:
                "We treat every patient with the utmost empathy, listening to your unique needs and making you feel safe and supported throughout your recovery.",
              icon: "https://img.icons8.com/ios/96/FFFFFF/hand-holding-heart.png",
              delay: "",
            },
            {
              title: "Evidence-Based Therapy",
              desc:
                "Our treatments are rooted in the latest scientific research and proven clinical methods, ensuring you receive the most effective care possible.",
              icon: "https://img.icons8.com/ios/96/FFFFFF/microscope.png",
              delay: "ab-reveal-delay",
            },
            {
              title: "Continuous Support",
              desc:
                "Healing doesn't stop when you leave our clinic. We provide ongoing education, home exercises, and guidance to keep you healthy long-term.",
              icon: "https://img.icons8.com/ios/96/FFFFFF/infinity.png",
              delay: "ab-reveal-delay-2",
            },
          ].map((value, idx) => (
            <div className={`ab-value-card ab-reveal ${value.delay}`} key={idx}>
              <div className="ab-value-icon-wrapper">
                <div className="ab-value-icon-ring"></div>
                <img src={value.icon} alt={value.title} />
              </div>
              <h3>{value.title}</h3>
              <p>{value.desc}</p>
              <div className="ab-value-line"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="ab-reviews">
        <div className="ab-reviews-inner">
          <div className="ab-reviews-left ab-reveal">
            <h2>Our Clients Reviews</h2>
            <p>
              At Afiya Care, we pride ourselves on providing exceptional
              physiotherapy services that deliver real results. But don't just
              take our word for it.
            </p>

            <div className="ab-rev-nav">
              <button className="ab-rev-btn" id="ab-revPrev">
                &#8592;
              </button>
              <button className="ab-rev-btn" id="ab-revNext">
                &#8594;
              </button>
            </div>

            <div className="ab-rev-dots" id="ab-revDots"></div>
          </div>

          <div className="ab-slider-wrap ab-reveal ab-reveal-delay">
            <div className="ab-reviews-track" id="ab-reviewsTrack">
              {[
                {
                  name: "Ella W.",
                  role: "Professional Athlete",
                  img: "https://randomuser.me/api/portraits/women/44.jpg",
                  text:
                    "After my knee surgery, the team at Afiya Care helped me regain my mobility in ways I never imagined. The personalized treatment plan was incredible.",
                },
                {
                  name: "Tom H.",
                  role: "Marathon Runner",
                  img: "https://randomuser.me/api/portraits/men/36.jpg",
                  text:
                    "The therapists here are amazing! I was dealing with chronic back pain, and after just a few sessions the difference was truly unbelievable.",
                },
                {
                  name: "Sara M.",
                  role: "Retired Teacher",
                  img: "https://randomuser.me/api/portraits/women/62.jpg",
                  text:
                    "I came in barely able to walk after my hip replacement. Within 8 weeks of therapy I was back on my feet. Afiya Care changed my life.",
                },
                {
                  name: "Khaled R.",
                  role: "Tennis Coach",
                  img: "https://randomuser.me/api/portraits/men/52.jpg",
                  text:
                    "Outstanding care from start to finish. The team diagnosed my shoulder issue quickly and had me playing tennis again in 6 weeks.",
                },
                {
                  name: "Nadia F.",
                  role: "Parent",
                  img: "https://randomuser.me/api/portraits/women/29.jpg",
                  text:
                    "My daughter had speech difficulties and the speech therapy team was so patient and professional. We saw real progress within a month.",
                },
                {
                  name: "Hassan A.",
                  role: "Retired Engineer",
                  img: "https://randomuser.me/api/portraits/men/71.jpg",
                  text:
                    "The home visit service is a game changer. Having expert physiotherapy come to you when mobility is limited is exactly what elderly care should look like.",
                },
              ].map((r, i) => (
                <div
                  className={`ab-review-card ${i < 2 ? "active" : ""}`}
                  key={r.name}
                >
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
    </>
  );
}