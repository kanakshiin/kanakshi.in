import { Metadata } from "next";
import Link from "next/link";
import { CustomLocketCustomizer } from "../../components/custom-locket-customizer";
import { ProductCard } from "../../components/product-card";
import { StructuredData } from "../../components/structured-data";
import { getHomePageData } from "../../lib/api";
import { referenceAssets } from "../../lib/reference-assets";

export const metadata: Metadata = {
  title: "Customized Name Lockets & Oxidised Jewellery | Kanakshi",
  description:
    "Design your custom handcrafted name locket in antique oxidised silver, vintage gold, and rose finish. Cash on delivery & fast nationwide delivery.",
  openGraph: {
    title: "Customized Name Lockets | Kanakshi",
    description:
      "Handcrafted personalized name necklaces & lockets. Choose your name, polish, and chain style with instant preview.",
    images: ["/jewellery/heart-necklace.jpg"]
  }
};

export default async function CustomNameLocketsPage() {
  const { settings, featuredProducts, newestProducts } = await getHomePageData();
  const currencySymbol = settings.site_currency_symbol || "₹";

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : newestProducts;
  const oxidisedPicks = displayProducts.slice(0, 4);

  const customLocketJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Customized Name Locket Necklace",
    image: "/jewellery/heart-necklace.jpg",
    description:
      "Handcrafted customized name necklace laser-cut in pure antique brass with anti-tarnish protective lacquer. Personalize with any name or couple initials.",
    brand: {
      "@type": "Brand",
      name: "Kanakshi"
    },
    offers: {
      "@type": "Offer",
      price: "399",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "2400"
    }
  };

  const faqs = [
    {
      q: "How do I specify the name for customization?",
      a: "Simply type your required name or word into the live customizer box above. You can also enter 2 names for couple sets (e.g. 'Aman ❤️ Priya')."
    },
    {
      q: "Will the polish fade or turn black?",
      a: "Our lockets are sealed with a dual-layer anti-tarnish lacquer coating that protects against sweat and oxidation during regular daily wear."
    },
    {
      q: "Is Cash on Delivery (COD) available?",
      a: "Yes! Cash on delivery is available across 19,000+ PIN codes in India."
    },
    {
      q: "How many days will delivery take?",
      a: "Custom cutting and polishing takes 1-2 working days, followed by 2-4 days express air courier delivery to your doorstep."
    },
    {
      q: "Can I verify the spelling before shipping?",
      a: "Yes! Our design team sends a WhatsApp confirmation with your digital layout proof before laser cutting."
    }
  ];

  return (
    <div className="custom-page-container">
      <StructuredData data={customLocketJsonLd} />

      {/* Breadcrumb Navigation */}
      <nav className="custom-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="current">Custom Name Lockets</span>
      </nav>

      {/* Main Interactive Customizer Section */}
      <section className="custom-builder-section">
        <CustomLocketCustomizer />
      </section>

      {/* How It Works - 3 Step Visual Guide */}
      <section className="custom-how-it-works-section">
        <div className="custom-section-title-wrap">
          <span className="kanakshi-section-eyebrow">Seamless 3-Step Process</span>
          <h2 className="kanakshi-section-title">How Your Custom Locket Is Created</h2>
          <p className="kanakshi-section-subtitle">
            Every piece is laser cut and hand-polished by master artisans in India.
          </p>
        </div>

        <div className="custom-steps-flow-grid">
          <div className="flow-step-card">
            <div className="flow-step-number">1</div>
            <h3>Type Your Name</h3>
            <p>Enter any name, nickname, or couple initials in English or Hindi script with live preview.</p>
          </div>
          <div className="flow-step-card">
            <div className="flow-step-number">2</div>
            <h3>Laser Cut &amp; Anti-Tarnish Coat</h3>
            <p>Artisans precision-cut your pendant in durable brass alloy and seal it with tarnish-resistant finish.</p>
          </div>
          <div className="flow-step-card">
            <div className="flow-step-number">3</div>
            <h3>Velvet Box &amp; Express Delivery</h3>
            <p>Packaged in our signature gift box and delivered via tracked courier directly to your doorstep.</p>
          </div>
        </div>
      </section>

      {/* Real Customer Photos & Unboxing UGC */}
      <section className="custom-ugc-section">
        <div className="custom-section-title-wrap">
          <span className="kanakshi-section-eyebrow">Real Customer Unboxings</span>
          <h2 className="kanakshi-section-title">Loved by Over 50,000+ Patrons</h2>
          <p className="kanakshi-section-subtitle">
            See how our customers wear and style their personalized name lockets.
          </p>
        </div>

        <div className="custom-ugc-grid">
          {[
            { img: referenceAssets.products.heartNecklace1, name: "Priya S., Mumbai", review: "Got my name locket in antique silver finish. The font looks super elegant and hasn't faded at all after 3 months of daily wear!" },
            { img: referenceAssets.products.roseGoldPendant1, name: "Rohan & Sneha, Delhi", review: "Ordered the Couple Combo with both our names. The packaging and velvet box made it the best surprise gift!" },
            { img: referenceAssets.products.heartNecklace2, name: "Ananya M., Bengaluru", review: "Super fast COD delivery. The WhatsApp team confirmed spelling before shipping. 10/10 recommend!" },
            { img: referenceAssets.products.coupleBands1, name: "Vikas K., Pune", review: "Gave this to my fiancée on our anniversary. She loved it! Beautiful vintage gold polish." }
          ].map((item, idx) => (
            <div key={idx} className="custom-ugc-card">
              <div className="custom-ugc-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.name} className="custom-ugc-img" loading="lazy" />
                <span className="ugc-verified-badge">✓ Verified Buyer</span>
              </div>
              <div className="custom-ugc-body">
                <div className="ugc-stars">★★★★★</div>
                <p className="ugc-quote">&ldquo;{item.review}&rdquo;</p>
                <div className="ugc-author">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="custom-faq-section">
        <div className="custom-section-title-wrap">
          <span className="kanakshi-section-eyebrow">Got Questions?</span>
          <h2 className="kanakshi-section-title">Frequently Asked Questions</h2>
        </div>

        <div className="custom-faq-list">
          {faqs.map((faq, i) => (
            <details key={i} className="custom-faq-item">
              <summary className="custom-faq-question">
                <span>{faq.q}</span>
                <span className="faq-toggle-icon">+</span>
              </summary>
              <div className="custom-faq-answer">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Explore More Oxidised Jewellery */}
      {oxidisedPicks.length > 0 && (
        <section className="custom-more-picks-section">
          <div className="custom-section-title-wrap">
            <span className="kanakshi-section-eyebrow">Pair With Your Locket</span>
            <h2 className="kanakshi-section-title">Trending Oxidised &amp; Antique Jewellery</h2>
            <p className="kanakshi-section-subtitle">Complete your look with matching rings, jhumkas, and bracelets.</p>
          </div>

          <div className="kanakshi-product-grid">
            {oxidisedPicks.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href="/shop" className="kanakshi-btn kanakshi-btn-outline kanakshi-btn-lg">
              View Entire Collection →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
