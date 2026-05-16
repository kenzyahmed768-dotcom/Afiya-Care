import { useState, useEffect } from "react";

const ARTICLES = {
  featured: {
    category: "featured",
    categoryLabel: "Featured",
    tag: "Featured",
    title: "5 Essential Stretches for Lower Back Pain Relief",
    desc: "Lower back pain affects millions worldwide, stemming from prolonged sitting, poor posture, or muscle imbalances. Explore evidence-based stretching techniques that provide immediate relief while addressing root causes of discomfort.",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=90",
    url: "https://www.healthline.com/health/lower-back-stretches",
    source: "Healthline",
  },
  healthTips: [
    {
      category: "healthTips",
      categoryLabel: "Health Tips",
      title: "Daily Exercises to Improve Posture",
      desc: "Simple yet effective exercises to correct poor posture and prevent future problems.",
      img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=85",
      url: "https://health.clevelandclinic.org/posture-exercises",
      source: "Cleveland Clinic",
    },
    {
      category: "healthTips",
      categoryLabel: "Health Tips",
      title: "Strengthening Core Muscles for Better Stability",
      desc: "Core strengthening exercises that improve balance, stability, and overall body function.",
      img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=85",
      url: "https://www.backcountry.physio/8-easy-physical-therapy-core-exercises-a-complete-guide/",
      source: "Backcountry Physio",
    },
  ],
  therapy: [
    {
      category: "therapy",
      categoryLabel: "Therapy",
      title: "Understanding Manual Therapy Techniques",
      desc: "A guide to various manual therapy approaches and how they can benefit your treatment plan.",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=700&q=85",
      url: "https://phoenixrehabgroup.com/articles/physiotherapy/manual-physiotherapy/",
      source: "Phoenix Rehab Group",
    },
    {
      category: "therapy",
      categoryLabel: "Therapy",
      title: "The Benefits of Regular Physiotherapy Sessions",
      desc: "How consistent physiotherapy can improve mobility, reduce chronic pain, and maintain optimal health.",
      img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&q=85",
      url: "https://ampedphysiotherapy.com/recovery-strength-and-injury-prevention-the-benefits-of-physiotherapy/",
      source: "Amped Physiotherapy",
    },
  ],
  injuries: [
    {
      category: "injuries",
      categoryLabel: "Injuries",
      title: "Sports Injury Prevention: Tips for Athletes",
      desc: "Strategies and exercises to help athletes prevent common injuries and maintain peak performance.",
      img: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=600&q=85",
      url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/sports-injuries/5-tips-for-preventing-sports-related-injuries",
      source: "Johns Hopkins Medicine",
    },
    {
      category: "injuries",
      categoryLabel: "Injuries",
      title: "Managing Chronic Pain Through Movement",
      desc: "How therapeutic exercises and movement can help manage and reduce chronic pain conditions.",
      img: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=600&q=85",
      url: "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/8-tips-for-managing-chronic-pain",
      source: "Mayo Clinic",
    },
    {
      category: "injuries",
      categoryLabel: "Injuries",
      title: "Knee Rehabilitation: Recovery Tips and Exercises",
      desc: "Expert advice on rehabilitating knee injuries with targeted exercises and proper recovery techniques.",
      img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=85",
      url: "https://www.healthline.com/health/exercises-for-knee-pain",
      source: "Healthline",
    },
  ],
  guides: [
    {
      category: "guides",
      categoryLabel: "Patient Guides",
      title: "Post-Surgery Rehabilitation: What to Expect",
      desc: "Understanding your recovery journey after orthopaedic surgery and how physiotherapy helps you heal.",
      img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&q=85",
      url: "https://blog.rehabselect.net/what-to-expect-in-post-surgery-rehabilitation",
      source: "Rehab Select",
    },
    {
      category: "guides",
      categoryLabel: "Patient Guides",
      title: "The Role of Physiotherapy in Elderly Care",
      desc: "How physiotherapy improves quality of life, mobility, and independence for older adults.",
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=85",
      url: "https://mirandasphysiosteps.com/benefits-of-physiotherapy/",
      source: "Miranda's Physio Steps",
    },
  ],
};

const CATEGORY_FILTERS = [
  { key: "all", label: "All Articles" },
  { key: "featured", label: "Featured" },
  { key: "healthTips", label: "Health Tips" },
  { key: "therapy", label: "Therapy" },
  { key: "injuries", label: "Injuries" },
  { key: "guides", label: "Patient Guides" },
  { key: "bookmarked", label: "Bookmarked" },
];

const SECTION_META = {
  featured:    { label: "Featured Article",         title: "Editor's Pick",             desc: "Our top recommended read for your recovery journey." },
  healthTips:  { label: "Health Tips & Exercises",  title: "Stay Active, Stay Well",     desc: "Practical exercises and wellness guidance rooted in evidence-based practice." },
  therapy:     { label: "Therapy & Information",    title: "Inside the Treatment Room",  desc: "In-depth explorations of therapeutic approaches and the science behind physiotherapy." },
  injuries:    { label: "Injuries & Conditions",    title: "Understanding Your Body",    desc: "Clinical insights into common musculoskeletal conditions and recovery protocols." },
  guides:      { label: "Patient Guides",           title: "Your Recovery Journey",      desc: "Comprehensive resources to help patients understand their treatment and optimise outcomes." },
  bookmarked:  { label: "Saved Articles",           title: "Your Bookmarked Blogs",      desc: "Articles you saved for quick access later." },
};

const getAllArticles = () => [
  ARTICLES.featured,
  ...ARTICLES.healthTips,
  ...ARTICLES.therapy,
  ...ARTICLES.injuries,
  ...ARTICLES.guides,
];

/* ─── CARD ─── */
function Card({ article, dark, isPatient, isBookmarked, onBookmark }) {
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
        boxShadow: hov
          ? "0 16px 40px rgba(0,0,0,0.12)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {isPatient && (
        <button
          type="button"
          onClick={() => onBookmark(article)}
          title={isBookmarked ? "Remove bookmark" : "Bookmark article"}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 4,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: isBookmarked ? "#29A8D8" : "rgba(15,35,71,0.72)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
            transition: "background 0.2s ease, transform 0.15s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isBookmarked ? "★" : "☆"}
        </button>
      )}

      <div style={{ height: 190, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={article.img}
          alt={article.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
      </div>

      <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase",
            color: dark ? "rgba(41,168,216,0.9)" : "#29A8D8",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {article.source}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            textTransform: "uppercase",
            color: dark ? "rgba(255,255,255,0.45)" : "#8aa0bb",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            • {article.categoryLabel}
          </span>
        </div>

        <h3 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 16,
          fontWeight: 700,
          color: dark ? "#fff" : "#0F2347",
          margin: "0 0 10px",
          lineHeight: 1.35,
        }}>
          {article.title}
        </h3>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: dark ? "rgba(200,218,240,0.68)" : "#637B9A",
          lineHeight: 1.7,
          margin: "0 0 18px",
          flex: 1,
        }}>
          {article.desc}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            color: "#29A8D8",
            textDecoration: "none",
            borderBottom: "1.5px solid #29A8D8",
            paddingBottom: 1,
            width: "fit-content",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#1a82ad"; e.currentTarget.style.borderBottomColor = "#1a82ad"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#29A8D8"; e.currentTarget.style.borderBottomColor = "#29A8D8"; }}
        >
          Read article →
        </a>
      </div>
    </div>
  );
}

/* ─── FEATURED HERO CARD ─── */
function FeaturedHeroCard({ article, isPatient, isBookmarked, onBookmark }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      border: "1px solid #e4eaf2",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(15,35,71,0.07)",
    }}>
      <div style={{ overflow: "hidden", minHeight: 340 }}>
        <img
          src={article.img}
          alt={article.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ padding: "44px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", background: "#fff" }}>
        {isPatient && (
          <button
            type="button"
            onClick={() => onBookmark(article)}
            title={isBookmarked ? "Remove bookmark" : "Bookmark article"}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 40, height: 40, borderRadius: "50%",
              border: "none",
              background: isBookmarked ? "#29A8D8" : "#0F2347",
              color: "#fff", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
              transition: "background 0.2s ease, transform 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{
            background: "#E6F6FC", color: "#0d6e96",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10, fontWeight: 700,
            padding: "4px 13px", borderRadius: 20,
            letterSpacing: 1.2, textTransform: "uppercase",
          }}>
            Featured
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10, color: "#637B9A",
            textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700,
          }}>
            {article.source}
          </span>
        </div>

        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 26, fontWeight: 700,
          color: "#0F2347", margin: "0 0 14px", lineHeight: 1.3,
        }}>
          {article.title}
        </h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: "#637B9A",
          lineHeight: 1.8, marginBottom: 28,
        }}>
          {article.desc}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            color: "#29A8D8", textDecoration: "none",
            borderBottom: "1.5px solid #29A8D8",
            paddingBottom: 1, width: "fit-content",
          }}
        >
          Read article →
        </a>
      </div>
    </div>
  );
}

/* ─── HELPERS ─── */
function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
      <div style={{ width: 32, height: 2, background: "#29A8D8" }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11, fontWeight: 700,
        letterSpacing: 2.5, textTransform: "uppercase",
        color: "#29A8D8",
      }}>
        {text}
      </span>
    </div>
  );
}

function SectionTitle({ title, desc, dark }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 30, fontWeight: 700,
        color: dark ? "#fff" : "#0F2347",
        margin: "0 0 12px", lineHeight: 1.2,
      }}>
        {title}
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: dark ? "rgba(200,218,240,0.65)" : "#637B9A",
        lineHeight: 1.75, maxWidth: 520, margin: 0,
      }}>
        {desc}
      </p>
    </div>
  );
}

function EmptyState({ isBookmark }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e4eaf2",
      borderRadius: 16, padding: "60px 30px",
      textAlign: "center",
      boxShadow: "0 4px 24px rgba(15,35,71,0.06)",
    }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>
        {isBookmark ? "☆" : "📚"}
      </div>
      <h3 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 24, color: "#0F2347", margin: "0 0 8px",
      }}>
        {isBookmark ? "No bookmarks yet" : "No articles found"}
      </h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#637B9A", margin: 0 }}>
        {isBookmark
          ? "Tap the ☆ icon on any article to save it here."
          : "Try choosing another category."}
      </p>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function AfiyaCareBlog() {
  const [loaded, setLoaded]           = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [bookmarks, setBookmarks]     = useState([]);

  const role      = localStorage.getItem("role");
  const isPatient = role === "patient";

  useEffect(() => {
    setTimeout(() => setLoaded(true), 80);
    const saved = JSON.parse(localStorage.getItem("bookmarkedBlogs") || "[]");
    setBookmarks(saved);
  }, []);

  const fade = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  const toggleBookmark = (article) => {
    if (!isPatient) return;
    const exists  = bookmarks.some((b) => b.title === article.title);
    const updated = exists
      ? bookmarks.filter((b) => b.title !== article.title)
      : [...bookmarks, article];
    setBookmarks(updated);
    localStorage.setItem("bookmarkedBlogs", JSON.stringify(updated));
  };

  const isBookmarked   = (article) => bookmarks.some((b) => b.title === article.title);
  const allArticles    = getAllArticles();

  const filteredArticles =
    activeFilter === "all"       ? allArticles :
    activeFilter === "bookmarked"? bookmarks :
    allArticles.filter((a) => a.category === activeFilter);

  const W = { maxWidth: 1120, margin: "0 auto" };

  /* shared card props */
  const cardProps = (article, dark = false) => ({
    article,
    dark,
    isPatient,
    isBookmarked: isBookmarked(article),
    onBookmark: toggleBookmark,
  });

  /* ── FILTER BAR ── */
  const FilterBar = () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
      {CATEGORY_FILTERS
        .filter((f) => isPatient || f.key !== "bookmarked")
        .map((filter) => {
          const active = activeFilter === filter.key;
          const count  = filter.key === "bookmarked" ? bookmarks.length : null;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              style={{
                border:      active ? "1px solid #29A8D8" : "1px solid rgba(255,255,255,0.18)",
                background:  active ? "#29A8D8" : "rgba(255,255,255,0.08)",
                color:       "#fff",
                borderRadius: 999,
                padding:     "9px 18px",
                fontFamily:  "'DM Sans', sans-serif",
                fontSize:    13,
                fontWeight:  700,
                cursor:      "pointer",
                display:     "flex",
                alignItems:  "center",
                gap:         6,
                transition:  "background 0.2s ease, border-color 0.2s ease",
              }}
            >
              {filter.label}
              {count !== null && count > 0 && (
                <span style={{
                  background:   active ? "rgba(255,255,255,0.28)" : "#29A8D8",
                  borderRadius: 999,
                  padding:      "1px 7px",
                  fontSize:     11,
                  fontWeight:   700,
                  lineHeight:   "18px",
                  minWidth:     18,
                  textAlign:    "center",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );

  /* ── ALL ARTICLES VIEW — sectioned layout ── */
  const AllView = () => (
    <>
      {/* Featured */}
      <div style={{ background: "#fff", padding: "56px 40px" }}>
        <div style={{ ...W, ...fade(0.1) }}>
          <SectionLabel text="Featured Article" />
          <div style={{ marginBottom: 36 }} />
          <FeaturedHeroCard
            article={ARTICLES.featured}
            isPatient={isPatient}
            isBookmarked={isBookmarked(ARTICLES.featured)}
            onBookmark={toggleBookmark}
          />
        </div>
      </div>

      {/* Health Tips */}
      <div style={{ background: "#F7F9FC", padding: "56px 40px" }}>
        <div style={{ ...W, ...fade(0.12) }}>
          <SectionLabel text="Health Tips & Exercises" />
          <SectionTitle title="Stay Active, Stay Well" desc="Practical exercises and wellness guidance rooted in evidence-based practice to support your daily physical health." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {ARTICLES.healthTips.map((a) => <Card key={a.title} {...cardProps(a)} />)}
          </div>
        </div>
      </div>

      {/* Therapy */}
      <div style={{ background: "#0F2347", padding: "56px 40px" }}>
        <div style={{ ...W, ...fade(0.12) }}>
          <SectionLabel text="Therapy & Information" />
          <SectionTitle title="Inside the Treatment Room" desc="In-depth explorations of therapeutic approaches, methodologies, and the science behind effective physiotherapy." dark />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {ARTICLES.therapy.map((a) => <Card key={a.title} {...cardProps(a, true)} />)}
          </div>
        </div>
      </div>

      {/* Injuries */}
      <div style={{ background: "#fff", padding: "56px 40px" }}>
        <div style={{ ...W, ...fade(0.12) }}>
          <SectionLabel text="Injuries & Conditions" />
          <SectionTitle title="Understanding Your Body" desc="Clinical insights into common musculoskeletal conditions, injury prevention strategies, and recovery protocols." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {ARTICLES.injuries.map((a) => <Card key={a.title} {...cardProps(a)} />)}
          </div>
        </div>
      </div>

      {/* Guides */}
      <div style={{ background: "#F7F9FC", padding: "56px 40px 72px" }}>
        <div style={{ ...W, ...fade(0.12) }}>
          <SectionLabel text="Patient Guides" />
          <SectionTitle title="Your Recovery Journey" desc="Comprehensive educational resources to help patients understand their treatment journey and optimise recovery outcomes." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {ARTICLES.guides.map((a) => <Card key={a.title} {...cardProps(a)} />)}
          </div>
        </div>
      </div>
    </>
  );

  /* ── FILTERED VIEW — flat grid ── */
  const FilteredView = () => {
    const meta        = SECTION_META[activeFilter] || {};
    const isDark      = activeFilter === "therapy";
    const isBg2       = activeFilter === "healthTips" || activeFilter === "guides" || activeFilter === "bookmarked";
    const bgColor     = isDark ? "#0F2347" : isBg2 ? "#F7F9FC" : "#fff";

    /* featured gets its own hero layout */
    if (activeFilter === "featured") {
      return (
        <div style={{ background: "#fff", padding: "56px 40px 72px" }}>
          <div style={{ ...W, ...fade(0.1) }}>
            <SectionLabel text={meta.label} />
            <div style={{ marginBottom: 36 }} />
            <FeaturedHeroCard
              article={ARTICLES.featured}
              isPatient={isPatient}
              isBookmarked={isBookmarked(ARTICLES.featured)}
              onBookmark={toggleBookmark}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={{ background: bgColor, padding: "56px 40px 72px" }}>
        <div style={{ ...W, ...fade(0.1) }}>
          <SectionLabel text={meta.label || activeFilter} />
          <SectionTitle title={meta.title || activeFilter} desc={meta.desc || ""} dark={isDark} />

          {filteredArticles.length === 0 ? (
            <EmptyState isBookmark={activeFilter === "bookmarked"} />
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}>
              {filteredArticles.map((a) => (
                <Card key={a.title} {...cardProps(a, isDark)} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,900;1,700&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ background: "#F7F9FC", minHeight: "100vh" }}>

        {/* HERO / HEADER */}
        <div style={{ background: "#0F2347", padding: "60px 40px 56px" }}>
          <div style={{ ...W, ...fade(0) }}>
            <div style={{ maxWidth: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <div style={{ width: 32, height: 2, background: "#29A8D8" }} />
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: 2.5, textTransform: "uppercase",
                  color: "#29A8D8",
                }}>
                  Afiya Care — Blog
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(34px, 4vw, 52px)",
                fontWeight: 900,
                color: "#fff",
                margin: "12px 0 18px",
                lineHeight: 1.12,
                letterSpacing: -1,
              }}>
                Evidence-based<br />
                <span style={{ color: "#29A8D8", fontStyle: "italic" }}>
                  recovery, explained.
                </span>
              </h1>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: "rgba(200,218,240,0.75)",
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 560,
              }}>
                Expert insights and guidance to support your recovery and long-term physical health through physiotherapy.
              </p>

              <FilterBar />

              {isPatient && (
                <p style={{
                  marginTop: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "rgba(200,218,240,0.5)",
                }}>
                  Tip: tap the ☆ icon on any article to save it to your bookmarks.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {activeFilter === "all" ? <AllView /> : <FilteredView />}

      </div>
    </>
  );
}