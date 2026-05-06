import { useState, useEffect } from "react";

const ARTICLES = {
  featured: {
    tag: "Featured",
    title: "5 Essential Stretches for Lower Back Pain Relief",
    desc: "Lower back pain affects millions worldwide, stemming from prolonged sitting, poor posture, or muscle imbalances. Explore evidence-based stretching techniques that provide immediate relief while addressing root causes of discomfort.",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=90",
    url: "https://www.healthline.com/health/lower-back-stretches",
    source: "Healthline",
  },
  healthTips: [
    {
      title: "Daily Exercises to Improve Posture",
      desc: "Simple yet effective exercises to correct poor posture and prevent future problems.",
      img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=85",
      url: "https://health.clevelandclinic.org/posture-exercises",
      source: "Cleveland Clinic",
    },
    {
      title: "Strengthening Core Muscles for Better Stability",
      desc: "Core strengthening exercises that improve balance, stability, and overall body function.",
      img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=85",
      url: "https://www.backcountry.physio/8-easy-physical-therapy-core-exercises-a-complete-guide/",
      source: "Backcountry Physio",
    },
  ],
  therapy: [
    {
      title: "Understanding Manual Therapy Techniques",
      desc: "A guide to various manual therapy approaches and how they can benefit your treatment plan.",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=700&q=85",
      url: "https://phoenixrehabgroup.com/articles/physiotherapy/manual-physiotherapy/",
      source: "Phoenix Rehab Group",
    },
    {
      title: "The Benefits of Regular Physiotherapy Sessions",
      desc: "How consistent physiotherapy can improve mobility, reduce chronic pain, and maintain optimal health.",
      img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&q=85",
      url: "https://ampedphysiotherapy.com/recovery-strength-and-injury-prevention-the-benefits-of-physiotherapy/",
      source: "Amped Physiotherapy",
    },
  ],
  injuries: [
    {
      title: "Sports Injury Prevention: Tips for Athletes",
      desc: "Strategies and exercises to help athletes prevent common injuries and maintain peak performance.",
      img: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=600&q=85",
      url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/sports-injuries/5-tips-for-preventing-sports-related-injuries",
      source: "Johns Hopkins Medicine",
    },
    {
      title: "Managing Chronic Pain Through Movement",
      desc: "How therapeutic exercises and movement can help manage and reduce chronic pain conditions.",
      img: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=600&q=85",
      url: "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/8-tips-for-managing-chronic-pain",
      source: "Mayo Clinic",
    },
    {
      title: "Knee Rehabilitation: Recovery Tips and Exercises",
      desc: "Expert advice on rehabilitating knee injuries with targeted exercises and proper recovery techniques.",
      img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=85",
      url: "https://www.healthline.com/health/exercises-for-knee-pain",
      source: "Healthline",
    },
  ],
  guides: [
    {
      title: "Post-Surgery Rehabilitation: What to Expect",
      desc: "Understanding your recovery journey after orthopaedic surgery and how physiotherapy helps you heal.",
      img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&q=85",
      url: "https://blog.rehabselect.net/what-to-expect-in-post-surgery-rehabilitation",
      source: "Rehab Select",
    },
    {
      title: "The Role of Physiotherapy in Elderly Care",
      desc: "How physiotherapy improves quality of life, mobility, and independence for older adults.",
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=85",
      url: "https://mirandasphysiosteps.com/benefits-of-physiotherapy/",
      source: "Miranda's Physio Steps",
    },
  ],
};

function Card({ article, dark }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: dark ? "rgba(255,255,255,0.06)" : "#fff",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e4eaf2"}`,
        borderRadius: 12,
        overflow: "hidden",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? "0 16px 40px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 200, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={article.img}
          alt={article.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
      </div>
      <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          textTransform: "uppercase", color: dark ? "rgba(41,168,216,0.85)" : "#29A8D8",
          fontFamily: "'DM Sans', sans-serif", marginBottom: 8, display: "block",
        }}>{article.source}</span>
        <h3 style={{
          fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700,
          color: dark ? "#fff" : "#0F2347",
          margin: "0 0 10px", lineHeight: 1.35,
        }}>{article.title}</h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          color: dark ? "rgba(200,218,240,0.7)" : "#637B9A",
          lineHeight: 1.7, margin: "0 0 20px", flex: 1,
        }}>{article.desc}</p>
        <a
          href={article.url} target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            color: "#29A8D8", textDecoration: "none",
            borderBottom: "1.5px solid #29A8D8", paddingBottom: 1,
            width: "fit-content", transition: "color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#1a82ad"; e.currentTarget.style.borderBottomColor = "#1a82ad"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#29A8D8"; e.currentTarget.style.borderBottomColor = "#29A8D8"; }}
        >Read article →</a>
      </div>
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
      <div style={{ width: 32, height: 2, background: "#29A8D8" }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
        letterSpacing: 2.5, textTransform: "uppercase", color: "#29A8D8",
      }}>{text}</span>
    </div>
  );
}

function SectionTitle({ title, desc, dark }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 700,
        color: dark ? "#fff" : "#0F2347",
        margin: "0 0 12px", lineHeight: 1.2,
      }}>{title}</h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14,
        color: dark ? "rgba(200,218,240,0.65)" : "#637B9A",
        lineHeight: 1.75, maxWidth: 520, margin: 0,
      }}>{desc}</p>
    </div>
  );
}

export default function AfiyaCareBlog() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const fade = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  const W = { maxWidth: 1120, margin: "0 auto" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,900;1,700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ background: "#F7F9FC", minHeight: "100vh" }}>

        <div style={{ background: "#0F2347", padding: "60px 40px 56px" }}>
          <div style={{ ...W, ...fade(0) }}>
            <div style={{ maxWidth: 680 }}>
              <SectionLabel text="Afiya Care — Blog" />
              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(34px, 4vw, 52px)",
                fontWeight: 900, color: "#fff",
                margin: "12px 0 18px", lineHeight: 1.12, letterSpacing: -1,
              }}>
                Evidence-based<br />
                <span style={{ color: "#29A8D8", fontStyle: "italic" }}>recovery, explained.</span>
              </h1>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 16,
                color: "rgba(200,218,240,0.75)", lineHeight: 1.8,
                margin: 0, maxWidth: 480,
              }}>
                Expert insights and guidance to support your recovery and long-term physical health through physiotherapy.
              </p>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "56px 40px" }}>
          <div style={{ ...W, ...fade(0.1) }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              border: "1px solid #e4eaf2", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 4px 24px rgba(15,35,71,0.07)",
            }}>
              <div style={{ overflow: "hidden" }}>
                <img
                  src={ARTICLES.featured.img}
                  alt={ARTICLES.featured.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ padding: "44px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{
                    background: "#E6F6FC", color: "#0d6e96",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                    fontWeight: 700, padding: "4px 13px", borderRadius: 20,
                    letterSpacing: 1.2, textTransform: "uppercase",
                  }}>Featured</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                    color: "#637B9A", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700,
                  }}>{ARTICLES.featured.source}</span>
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700,
                  color: "#0F2347", margin: "0 0 14px", lineHeight: 1.3,
                }}>{ARTICLES.featured.title}</h2>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: "#637B9A", lineHeight: 1.8, marginBottom: 28,
                }}>{ARTICLES.featured.desc}</p>
                <a
                  href={ARTICLES.featured.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    color: "#29A8D8", textDecoration: "none",
                    borderBottom: "1.5px solid #29A8D8", paddingBottom: 1, width: "fit-content",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#1a82ad"; e.currentTarget.style.borderBottomColor = "#1a82ad"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#29A8D8"; e.currentTarget.style.borderBottomColor = "#29A8D8"; }}
                >Read article →</a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#F7F9FC", padding: "56px 40px" }}>
          <div style={{ ...W, ...fade(0.15) }}>
            <SectionLabel text="Health Tips & Exercises" />
            <SectionTitle
              title="Stay Active, Stay Well"
              desc="Practical exercises and wellness guidance rooted in evidence-based practice to support your daily physical health."
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {ARTICLES.healthTips.map(a => <Card key={a.title} article={a} />)}
            </div>
          </div>
        </div>

        <div style={{ background: "#0F2347", padding: "56px 40px" }}>
          <div style={{ ...W, ...fade(0.15) }}>
            <SectionLabel text="Therapy & Information" />
            <SectionTitle
              title="Inside the Treatment Room"
              desc="In-depth explorations of therapeutic approaches, methodologies, and the science behind effective physiotherapy."
              dark
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {ARTICLES.therapy.map(a => <Card key={a.title} article={a} dark />)}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "56px 40px" }}>
          <div style={{ ...W, ...fade(0.15) }}>
            <SectionLabel text="Injuries & Conditions" />
            <SectionTitle
              title="Understanding Your Body"
              desc="Clinical insights into common musculoskeletal conditions, injury prevention strategies, and recovery protocols."
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              {ARTICLES.injuries.map(a => <Card key={a.title} article={a} />)}
            </div>
          </div>
        </div>

        <div style={{ background: "#F7F9FC", padding: "56px 40px 72px" }}>
          <div style={{ ...W, ...fade(0.15) }}>
            <SectionLabel text="Patient Guides" />
            <SectionTitle
              title="Your Recovery Journey"
              desc="Comprehensive educational resources to help patients understand their treatment journey and optimise recovery outcomes."
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {ARTICLES.guides.map(a => <Card key={a.title} article={a} />)}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
