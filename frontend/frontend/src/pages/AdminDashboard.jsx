import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../style/Homepage.css";

function Homepage() {
  const services = [
    {
      title: "Cardiac Rehab",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    },
    {
      title: "Sports Physiotherapy",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    },
    {
      title: "Orthopedic Physiotherapy",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    },
    {
      title: "Surgical Rehabilitation",
      image:
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80",
    },
    {
      title: "Neurological Rehabilitation",
      image:
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80",
    },
    {
      title: "Pediatric Physiotherapy",
      image:
        "https://images.unsplash.com/photo-1576765608622-067973a79f53?w=400&q=80",
    },
    {
      title: "Home Physiotherapy",
      image:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80",
    },
    {
      title: "Pain Management",
      image:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setCardsPerView(1);
      } else if (window.innerWidth <= 900) {
        setCardsPerView(2);
      } else {
        setCardsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(services.length - cardsPerView, 0);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <>
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            Welcome To Afiya Care—
            <br />
            Your Path To Better Health
          </h1>
          <p>Expert Physiotherapy Tailored To Your Recovery</p>
          <Link to="/booking" className="btn-primary">
            Book An Appointment
          </Link>
        </div>
      </section>

      <section className="services">
        <div className="services-header">
          <div>
            <div className="section-label">OUR SERVICES</div>
            <h2>Our Physiotherapy Services</h2>
            <p>Your recovery, your choice – at home or in-clinic sessions.</p>
          </div>

          <div className="nav-arrows">
            <button className="arrow-btn" aria-label="Previous" onClick={prevSlide}>
              ←
            </button>
            <button className="arrow-btn active" aria-label="Next" onClick={nextSlide}>
              →
            </button>
          </div>
        </div>

        <div className="services-carousel">
          <div
            className="services-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
            }}
          >
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-card-inner">
                  <div className="service-img">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="service-label">{service.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="services-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`dot ${currentIndex === index ? "active-dot" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="why-section">
        <div className="why-image">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80"
            alt="Physiotherapy session"
          />
        </div>
        <div className="why-content">
          <h2>Why Afiya Care?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🏠</div>
              <h4>Flexible Care Options</h4>
              <p>Receive physiotherapy in-clinic or at the comfort of your home.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">👨‍⚕️</div>
              <h4>Experienced Therapists</h4>
              <p>Our therapists boast of 40+ years of combined experience.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📋</div>
              <h4>Personalized Programs</h4>
              <p>Tailored treatment plans designed for your unique needs and goals.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h4>Modern Facilities &amp; Techniques</h4>
              <p>
                Using the latest equipment and evidence-based practices for effective
                recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-form-area">
          <h3>Got a Question?</h3>
          <h2>
            Get in Touch
            <br />
            Submit an inquiry and our
            <br />
            team will get back to you
          </h2>
          <div className="form-row">
            <div className="form-field">
              <input type="text" placeholder="Full Name*" />
            </div>
            <div className="form-field">
              <input type="email" placeholder="Email*" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <input type="tel" placeholder="Phone Number*" />
            </div>
            <div className="form-field">
              <input type="text" placeholder="Inquiry*" />
            </div>
          </div>
          <button className="btn-submit">Submit Inquiry</button>
        </div>

        <div className="contact-image-area">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80"
            alt="Medical team"
          />
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>
              "Afiya Care's at-home sessions have made my recovery so much easier.
              The team is professional and really effective!"
            </p>
            <div className="author">— Sara M., Cairo</div>
          </div>
        </div>
      </section>

      <section className="blog-section">
        <div className="section-label">Latest News</div>
        <h2>
          News and blogs about
          <br />
          physiotherapy
        </h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80"
              alt="Exercises"
            />
            <div className="blog-card-body">
              <h3>5 Physiotherapy Exercises You Can Do at Home</h3>
              <a href="#" className="blog-read">
                Read more
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="blog-card">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80"
              alt="Neural"
            />
            <div className="blog-card-body">
              <h3>The Science Behind Physiotherapy and Neural Recovery</h3>
              <a href="#" className="blog-read">
                Read more
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="blog-card">
            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"
              alt="Pain"
            />
            <div className="blog-card-body">
              <h3>Understanding Pain: When to See a Specialist</h3>
              <a href="#" className="blog-read">
                Read more
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Homepage;