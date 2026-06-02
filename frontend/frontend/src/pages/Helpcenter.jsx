import { useState } from "react";
import "../style/HelpCenter.css";

const FAQ = {
  General: [
    {
      q: "What is AfiyaCare?",
      a: "AfiyaCare is a platform that connects patients with certified physiotherapists for in-clinic and at-home sessions across Egypt.",
    },
    {
      q: "How do I create an account?",
      a: "Click Register on the homepage, fill in your details, and choose whether you're registering as a patient or a doctor.",
    },
    {
      q: "Is my personal information safe?",
      a: "Yes. We use secure authentication and protected access to keep personal data safe.",
    },
    {
      q: "Can I use AfiyaCare on mobile?",
      a: "Yes. AfiyaCare is responsive and works on mobile, tablet, and desktop browsers.",
    },
    {
      q: "How do I reset my password?",
      a: "Click Forgot Password on the login page, enter your email, and follow the reset link sent to you.",
    },
  ],

  "Payments & Packages": [
    {
      q: "What packages are available?",
      a: "We offer different physiotherapy packages depending on the patient’s recovery needs and number of sessions.",
    },
    {
      q: "What payment methods are accepted?",
      a: "Payment options can include cash on session or other available methods depending on the service.",
    },
    {
      q: "Can I get a refund?",
      a: "Refunds or cancellations depend on the appointment timing and cancellation policy.",
    },
    {
      q: "Are there any hidden fees?",
      a: "No. The service price should be clear before confirming the booking.",
    },
    {
      q: "Can I upgrade my package?",
      a: "Yes, you can contact support to discuss package changes or upgrades.",
    },
  ],

  "Technical Issues": [
    {
      q: "I can't log into my account.",
      a: "Try resetting your password first. If the issue continues, clear your browser cache or try another browser.",
    },
    {
      q: "The booking page is not loading doctors.",
      a: "Refresh the page and check your internet connection. If it still does not work, contact support.",
    },
    {
      q: "My chat messages aren't sending.",
      a: "Check your internet connection, then log out and log back in.",
    },
    {
      q: "I'm not receiving email notifications.",
      a: "Check your spam folder and make sure your account email address is correct.",
    },
    {
      q: "The website is running slowly.",
      a: "Try clearing your browser cache and closing extra tabs.",
    },
  ],
};

const CONTACT_CHANNELS = [
  {
    icon: "📞",
    label: "Phone Call",
    value: "+20 12345677",
    href: "tel:+2012345677",
    color: "#00b4a2",
  },
  {
    icon: "📧",
    label: "Email",
    value: "afiyacare@gmail.com",
    href: "mailto:afiyacare@gmail.com",
    color: "#3b82f6",
  },
  {
    icon: "💬",
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    href: "https://wa.me/201014737320",
    color: "#25d366",
  },
  {
    icon: "📘",
    label: "Facebook",
    value: "AfiyaCare",
    href: "https://www.facebook.com/profile.php?id=61585057423569",
    color: "#1877f2",
  },
  {
    icon: "📸",
    label: "Instagram",
    value: "@afiyacare_1",
    href: "https://www.instagram.com/afiyacare_1/?hl=en",
    color: "#e1306c",
  },
];

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState("faq");
  const [faqCategory, setFaqCategory] = useState("General");
  const [openFaq, setOpenFaq] = useState(null);

  const tabs = [
    { key: "faq", icon: "❓", label: "FAQ" },
    { key: "contact", icon: "📬", label: "Contact Us" },
  ];

  const handleCategoryChange = (category) => {
    setFaqCategory(category);
    setOpenFaq(null);
  };

  return (
    <div className="hc-page">
      <section className="hc-hero">
        <div className="hc-hero-overlay" />

        <div className="hc-hero-content">
          <span className="hc-tag">✦ Help Center</span>

          <h1>
            How Can We
            <br />
            <em>Help You?</em>
          </h1>

          <p>
            Find answers, get in touch, or browse our FAQ. We are here to help
            you with bookings, accounts, payments, and technical issues.
          </p>

          <div className="hc-hero-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`hc-hero-tab ${
                  activeTab === tab.key ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="hc-content">
        {activeTab === "faq" && (
          <section className="hc-faq">
            <aside className="hc-faq-sidebar">
              <h3>Categories</h3>

              {Object.keys(FAQ).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`hc-cat-btn ${
                    faqCategory === category ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category === "General" && "🌐 "}
                  {category === "Payments & Packages" && "💳 "}
                  {category === "Technical Issues" && "🔧 "}
                  {category}
                </button>
              ))}

              <div className="hc-still-stuck">
                <h4>Still stuck?</h4>
                <p>
                  Can't find what you're looking for? Our support team is ready
                  to help.
                </p>

                <button
                  type="button"
                  className="hc-btn hc-btn-primary"
                  onClick={() => setActiveTab("contact")}
                >
                  Contact Us
                </button>
              </div>
            </aside>

            <div className="hc-faq-list">
              <div className="hc-faq-header">
                <h2>{faqCategory}</h2>
                <p>{FAQ[faqCategory].length} questions</p>
              </div>

              {FAQ[faqCategory].map((item, index) => (
                <article
                  key={item.q}
                  className={`hc-faq-item ${
                    openFaq === index ? "open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="hc-faq-q"
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                  >
                    <span>{item.q}</span>
                    <div
                      className={`hc-faq-arrow ${
                        openFaq === index ? "open" : ""
                      }`}
                    >
                      ›
                    </div>
                  </button>

                  {openFaq === index && (
                    <div className="hc-faq-a">{item.a}</div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="hc-contact">
            <div className="hc-contact-header">
              <h2>Get in Touch</h2>
              <p>
                Choose the channel that works best for you. We usually respond
                within a few hours.
              </p>
            </div>

            <div className="hc-contact-grid">
              {CONTACT_CHANNELS.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={
                    channel.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    channel.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="hc-channel-card"
                >
                  <div
                    className="hc-channel-icon"
                    style={{
                      background: `${channel.color}18`,
                      color: channel.color,
                    }}
                  >
                    {channel.icon}
                  </div>

                  <div className="hc-channel-info">
                    <h4>{channel.label}</h4>
                    <p>{channel.value}</p>
                  </div>

                  <div className="hc-channel-arrow">→</div>
                </a>
              ))}
            </div>

            <div className="hc-hours-card">
              <h3>🕐 Support Hours</h3>

              <div className="hc-hours-grid">
                <div>
                  <span>Sunday – Thursday</span>
                  <strong>8:00 AM – 6:00 PM</strong>
                </div>

                <div>
                  <span>Friday</span>
                  <strong>8:00 AM – 2:30 PM</strong>
                </div>

                <div>
                  <span>Saturday</span>
                  <strong>8:30 AM – 3:30 PM</strong>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}