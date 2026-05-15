import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import "../style/Homepage.css";

function Homepage() {
  const services = [
    {
      title: "Cardiac Rehab",
      image:
        "https://media.istockphoto.com/id/1488874743/photo/close-up-of-heart-rate-monitor-measuring-heartbeat.webp?a=1&b=1&s=612x612&w=0&k=20&c=hohHQ8LzJzekw7LqfrptMSUf0FI0m8fwqXVvkdsPrCE=",
    },
    {
      title: "Sports Physiotherapy",
      image:
        "https://media.istockphoto.com/id/2172581379/photo/personal-trainer-fitness-and-medicine-ball-in-gym-with-training-exercise-and-wellness.webp?a=1&b=1&s=612x612&w=0&k=20&c=RbVusA-OFZKdRSbAutp5K15uCaTtHa1drarg8jouEfk=",
    },
    {
      title: "Orthopedic Physiotherapy",
      image:
        "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Surgical Rehabilitation",
      image:
        "https://plus.unsplash.com/premium_photo-1681967126299-027d04269998?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3VyZ2ljYWwlMjByZWhhYmlsdGF0aW9ufGVufDB8fDB8fHww",
    },
    {
      title: "Neurological Rehabilitation",
      image:
        "https://media.istockphoto.com/id/1525314481/photo/professional-doctor-showing-elderly-patient-through-therapeutic-exercises-on-a-medicine-ball.webp?a=1&b=1&s=612x612&w=0&k=20&c=FaZGiGNstydmcBH_NVGqKfDrEfHfEU1JHPOj4jQp4DQ=",
    },
    {
      title: "Pediatric Physiotherapy",
      image:
        "https://images.unsplash.com/photo-1576765608622-067973a79f53?w=400&q=80",
    },
    {
      title: "Home Physiotherapy",
      image:
        "https://media.istockphoto.com/id/1313001485/photo/home-caregiver-helping-a-senior-man-standing-up-at-home.webp?a=1&b=1&s=612x612&w=0&k=20&c=ExAswsUptJrMcgliJ7aB9QBJcf3UAbLfzTZTFUZlefw=",
    },
    {
      title: "Pain Management",
      image:
        "https://plus.unsplash.com/premium_photo-1661721529633-db1a51e1d9bc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDl8fHBhaW4lMjBtYW5hZ2VtZW50JTIwcGh5c2lvdGhlcmFweXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      title: "Nursing & Wound Care",
      image:
        "https://images.unsplash.com/photo-1584516150909-c43483ee7938?w=900&q=80",
    },
    {
      title: "At Home Lab Tests",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
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
      setCurrentIndex(0);
    }
  }, [currentIndex, maxIndex]);

  const visibleServices = useMemo(() => {
    return services.slice(currentIndex, currentIndex + cardsPerView);
  }, [services, currentIndex, cardsPerView]);

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
          <Link to="/booking" className="btn-homepage">
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

        <div
          className="services-carousel-grid"
          style={{ gridTemplateColumns: `repeat(${cardsPerView}, 1fr)` }}
        >
          {visibleServices.map((service, index) => (
            <div className="service-card" key={`${service.title}-${index}`}>
              <div className="service-img">
                <img src={service.image} alt={service.title} />
              </div>
              <div className="service-label">{service.title}</div>
            </div>
          ))}
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
            src="https://portlandwellnesscare.com/wp-content/uploads/2022/08/how-effective-is-physiotherapy.jpg"
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
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Homepage;