import Link from "next/link";

import { StructuredData } from "../../components/structured-data";
import { HeroSlider } from "../../components/hero-slider";
import { ProductCard } from "../../components/product-card";
import { KanakshiStoryCircles } from "../../components/kanakshi-story-circles";
import { KanakshiMarqueeStrip } from "../../components/kanakshi-marquee-strip";
import { KanakshiTrustBadges } from "../../components/kanakshi-trust-badges";
import { getHomePageData } from "../../lib/api";
import { resolveFullHomepageContent } from "../../lib/homepage-content";
import { referenceAssets } from "../../lib/reference-assets";
import { getCanonicalUrl, getSiteDescription, getSiteName } from "../../lib/site";

export const revalidate = 60;

export default async function HomeTwoPage() {
  const { settings, categories, featuredProducts, newestProducts, homepageSections } = await getHomePageData();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const siteName = getSiteName(settings) || "Kanakshi Fine Jewellery";

  const fullHomepageSection = homepageSections.find((s) => s.section_key === "full-homepage");
  const homepageContent = resolveFullHomepageContent(
    (fullHomepageSection?.config as Record<string, unknown> | null) || null
  );

  const heroSlides = [
    {
      alt: "The Solitaire Diamond & Silver Edit",
      eyebrow: "Exclusive 2026 Collection",
      title: "Everyday Luxury Made For You",
      subtitle: "100% Certified 925 Sterling Silver, 18K Real Gold & Ethical Lab-Grown Diamonds. Backed by 7-Day Hassle-Free Returns.",
      image: referenceAssets.hero.primary,
      href: "/shop?sort=bestseller",
      buttonText: "Shop Solitaires →"
    },
    {
      alt: "925 Sterling Silver Everlasting Collection",
      eyebrow: "Anti-Tarnish Fine Silver",
      title: "Pure 925 Sterling Silver",
      subtitle: "Rhodium-coated everyday elegance designed for daily wear. Hypoallergenic, lightweight, and everlasting.",
      image: referenceAssets.hero.silver,
      href: "/shop/silver-jewellery",
      buttonText: "Explore 925 Silver →"
    },
    {
      alt: "Romantic Heart & Anniversary Gifts",
      eyebrow: "Gifting Edits for Love",
      title: "Gifts That Speak Love",
      subtitle: "Rose gold heart lockets, matching couple promise bands, and sparkling tennis bracelets in signature velvet gift boxes.",
      image: referenceAssets.hero.valentines,
      href: "/shop/gifting-edits",
      buttonText: "Shop Gifting Picks →"
    },
    {
      alt: "Men's Fine Jewellery & Chains",
      eyebrow: "Men's Bold Collection",
      title: "Contemporary Men's Jewellery",
      subtitle: "Diamond-cut Cuban chains, rugged oxidized rings, and masculine silver bracelets.",
      image: referenceAssets.hero.men,
      href: "/shop/mens-jewellery",
      buttonText: "Shop Men's Edit →"
    }
  ];

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : newestProducts;
  const bestSellerProducts = displayProducts.slice(0, 8);

  const homePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${siteName} | Fine Jewellery, 925 Silver & Lab Diamonds`,
    description: getSiteDescription(settings),
    url: getCanonicalUrl("/home-2", settings)
  };

  const metalsList = [
    {
      title: "925 Sterling Silver",
      tag: "Anti-Tarnish Rhodium",
      desc: "Pure hallmarked silver engineered for everyday wear with scratch-resistant shine.",
      image: referenceAssets.categories.silver,
      href: "/shop/silver-jewellery"
    },
    {
      title: "18K Gold & Lab Diamonds",
      tag: "IGI Certified",
      desc: "Solid gold brilliance with conflict-free, ethically grown DEF color diamonds.",
      image: referenceAssets.categories.gold,
      href: "/shop/gold-lab-diamonds"
    },
    {
      title: "Rose Gold Romance",
      tag: "18K Blush Plating",
      desc: "Warm blush tones that flatter every Indian skin tone with e-coat durability.",
      image: referenceAssets.products.roseGoldPendant1,
      href: "/shop/necklaces"
    },
    {
      title: "Heritage Oxidised Silver",
      tag: "Handcrafted Antique",
      desc: "Statement jhumkas, temple chokers, and artisanal tribal accents.",
      image: referenceAssets.products.pearlEarrings1,
      href: "/shop/earrings"
    }
  ];

  return (
    <>
      <StructuredData data={homePageJsonLd} />

      {/* 1. Hero Editorial Banner Slider (TOP) */}
      <HeroSlider slides={heroSlides} />

      {/* 2. Infinite Loop Marquee Strip (Free Insured Delivery, Easy Returns, 3,000+ Styles) */}
      <KanakshiMarqueeStrip />

      {/* 3. TOP CATEGORIES - Infinite Loop Story Circles (BELOW HERO) */}
      <KanakshiStoryCircles categories={categories} />

      {/* 4. Curated Best Sellers Grid */}
      <section className="kanakshi-section">
        <div className="kanakshi-container">
          <div className="kanakshi-section-header">
            <span className="kanakshi-section-eyebrow">Customer Favorites</span>
            <h2 className="kanakshi-section-title">Best Sellers in Fine Jewellery</h2>
            <p className="kanakshi-section-subtitle">
              The most loved solitaires, tennis bracelets, heart lockets, and 925 silver classics chosen by 200,000+ customers.
            </p>
          </div>

          <div className="kanakshi-product-grid">
            {bestSellerProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link href="/shop?sort=bestseller" className="kanakshi-btn kanakshi-btn-outline kanakshi-btn-lg">
              View All Best Sellers ({bestSellerProducts.length}+) →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Shop by Metal / Purity Showcase */}
      <section className="kanakshi-section" style={{ backgroundColor: "var(--kanakshi-bg-alt)" }}>
        <div className="kanakshi-container">
          <div className="kanakshi-section-header">
            <span className="kanakshi-section-eyebrow">Purity & Craft</span>
            <h2 className="kanakshi-section-title">Shop by Precious Metal</h2>
            <p className="kanakshi-section-subtitle">
              Every creation is stamped with authentic hallmark certifications and anti-tarnish protective barriers.
            </p>
          </div>

          <div className="kanakshi-category-showcase-grid">
            {metalsList.map((metal, idx) => (
              <Link
                key={idx}
                href={metal.href}
                className="kanakshi-card"
                style={{ overflow: "hidden", textDecoration: "none" }}
              >
                <div style={{ position: "relative", width: "100%", height: "200px", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={metal.image}
                    alt={metal.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)"
                    }}
                  />
                  <span
                    className="kanakshi-badge kanakshi-badge-pink"
                    style={{ position: "absolute", top: "10px", left: "10px", fontSize: "0.72rem" }}
                  >
                    {metal.tag}
                  </span>
                  <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", color: "#ffffff" }}>
                    <h3 style={{ color: "#ffffff", fontSize: "clamp(1rem, 2.5vw, 1.25rem)", marginBottom: "2px" }}>{metal.title}</h3>
                    <p style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.82rem)", color: "#f0f0f0", opacity: 0.9 }}>{metal.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Shop by Occasion / Gifting Edits */}
      <section className="kanakshi-section">
        <div className="kanakshi-container">
          <div className="kanakshi-section-header">
            <span className="kanakshi-section-eyebrow">Thoughtful Moments</span>
            <h2 className="kanakshi-section-title">Shop by Recipient & Occasion</h2>
            <p className="kanakshi-section-subtitle">
              Finding the perfect surprise has never been easier. Curated with luxury gift wrap and personal cards.
            </p>
          </div>

          <div className="kanakshi-occasions-grid">
            <Link href="/shop/gifting-edits" className="kanakshi-card" style={{ textDecoration: "none" }}>
              <div style={{ height: "180px", position: "relative", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={referenceAssets.hero.valentines}
                  alt="Gifts for Her"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }} />
                <span style={{ position: "absolute", bottom: "14px", left: "16px", color: "#ffffff", fontWeight: "700", fontSize: "1.1rem" }}>
                  Gifts for Her
                </span>
              </div>
            </Link>

            <Link href="/shop/mens-jewellery" className="kanakshi-card" style={{ textDecoration: "none" }}>
              <div style={{ height: "180px", position: "relative", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={referenceAssets.hero.men}
                  alt="Gifts for Him"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }} />
                <span style={{ position: "absolute", bottom: "14px", left: "16px", color: "#ffffff", fontWeight: "700", fontSize: "1.1rem" }}>
                  Gifts for Him
                </span>
              </div>
            </Link>

            <Link href="/shop/rings" className="kanakshi-card" style={{ textDecoration: "none" }}>
              <div style={{ height: "180px", position: "relative", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={referenceAssets.products.coupleBands1}
                  alt="Anniversary & Promise"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }} />
                <span style={{ position: "absolute", bottom: "14px", left: "16px", color: "#ffffff", fontWeight: "700", fontSize: "1.1rem" }}>
                  Couple Promise Bands
                </span>
              </div>
            </Link>

            <Link href="/shop?price=under-1999" className="kanakshi-card" style={{ textDecoration: "none" }}>
              <div style={{ height: "180px", position: "relative", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={referenceAssets.products.solitaireRing1}
                  alt="Affordable Sparkle"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }} />
                <span style={{ position: "absolute", bottom: "14px", left: "16px", color: "#ffffff", fontWeight: "700", fontSize: "1.1rem" }}>
                  Curated Under ₹1,999
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Trust & Guarantees Strip */}
      <KanakshiTrustBadges />

      {/* 8. Customer Reviews & Social Proof */}
      {homepageContent.testimonials?.items?.length > 0 && (
        <section className="kanakshi-section" style={{ backgroundColor: "var(--kanakshi-bg-alt)" }}>
          <div className="kanakshi-container">
            <div className="kanakshi-section-header">
              <span className="kanakshi-section-eyebrow">{homepageContent.testimonials.eyebrow || "Real Sparkle Stories"}</span>
              <h2 className="kanakshi-section-title">{homepageContent.testimonials.title || "Loved by Over 200,000+ Customers"}</h2>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <span style={{ color: "#f59e0b", fontSize: "1.2rem" }}>★★★★★</span>
                <span style={{ fontWeight: "700", color: "var(--kanakshi-black)" }}>4.9 / 5 Overall Rating</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {homepageContent.testimonials.items.map((review, i) => (
                <div key={i} className="kanakshi-review-card">
                  <div className="kanakshi-review-stars">
                    {review.stars || "★★★★★"}
                  </div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "8px" }}>{review.title}</h4>
                  <p style={{ fontSize: "0.88rem", color: "var(--kanakshi-text-muted)", lineHeight: "1.5", flex: 1 }}>
                    “{review.quote}”
                  </p>
                  <div className="kanakshi-review-author">
                    <span>{review.author}</span>
                    <span className="kanakshi-verified-pill">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: "3px", verticalAlign: "middle" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified Buyer
                    </span>
                  </div>
                  {review.product && (
                    <div style={{ fontSize: "0.75rem", color: "var(--kanakshi-pink-dark)", marginTop: "6px" }}>
                      Purchased: {review.product}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Instagram UGC #KanakshiSparkle Gallery */}
      <section className="kanakshi-section" style={{ backgroundColor: "var(--kanakshi-bg-alt)", paddingBottom: "72px" }}>
        <div className="kanakshi-container">
          <div className="kanakshi-section-header">
            <span className="kanakshi-section-eyebrow">#KanakshiSparkle</span>
            <h2 className="kanakshi-section-title">Styled by You on Instagram</h2>
            <p className="kanakshi-section-subtitle">
              Tag <a href="https://instagram.com/kanakshi.in" target="_blank" rel="noreferrer" style={{ color: "var(--kanakshi-pink)", fontWeight: "700" }}>@kanakshi.in</a> on Instagram to be featured in our weekly Sparkle Spotlight.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            {[
              { img: referenceAssets.products.solitaireRing1, alt: "Solitaire ring worn with elegant manicure" },
              { img: referenceAssets.products.heartNecklace1, alt: "Heart pendant styled with evening dress" },
              { img: referenceAssets.products.pearlEarrings1, alt: "Pearl studs styled for festive look" },
              { img: referenceAssets.products.tennisBracelet1, alt: "Tennis bracelet stacked on wrist" },
              { img: referenceAssets.products.roseGoldPendant1, alt: "Rose gold locket worn daily" },
              { img: referenceAssets.products.evilEyeBracelet1, alt: "Evil eye charm bracelet close up" },
            ].map((photo, i) => (
              <div key={i} style={{ position: "relative", width: "100%", paddingTop: "100%", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.img}
                  alt={photo.alt}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
