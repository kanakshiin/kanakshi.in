import React from "react";

export function KanakshiTrustBadges() {
  const guarantees = [
    {
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "BIS Hallmarked & Certified",
      desc: "100% genuine 925 sterling silver and authentic IGI-certified lab diamonds with authenticity certificate card."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "Anti-Tarnish Rhodium Finish",
      desc: "Every silver piece is treated with high-grade anti-tarnish protective coating to preserve lasting mirror sparkle."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      ),
      title: "7-Day Easy Doorstep Returns",
      desc: "Love it or return it within 7 days with free reverse pickup for a 100% instant refund or exchange."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: "Free Insured Express Delivery",
      desc: "Pan-India tamper-evident sealed packaging delivered right to your doorstep with transit insurance."
    }
  ];

  return (
    <section className="kanakshi-section" style={{ backgroundColor: "var(--kanakshi-bg-alt)" }}>
      <div className="kanakshi-container">
        <div className="kanakshi-section-header">
          <span className="kanakshi-section-eyebrow">The Kanakshi Guarantee</span>
          <h2 className="kanakshi-section-title">Fine Jewellery You Can Trust Forever</h2>
          <p className="kanakshi-section-subtitle">
            Every piece is crafted to the highest global benchmarks of quality, hypoallergenic comfort, and lasting shine.
          </p>
        </div>

        <div className="kanakshi-trust-grid">
          {guarantees.map((item, index) => (
            <div key={index} className="kanakshi-trust-card">
              <div className="kanakshi-trust-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kanakshi-pink)" }}>
                {item.icon}
              </div>
              <h3 className="kanakshi-trust-title">{item.title}</h3>
              <p className="kanakshi-trust-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
